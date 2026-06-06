import { Prisma } from "@prisma/client";

type TxClient = Prisma.TransactionClient;

async function deleteOrphanParentRecords(tx: TxClient, parentIds: string[]) {
  const uniqueParentIds = Array.from(new Set(parentIds.filter(Boolean)));

  for (const parentId of uniqueParentIds) {
    const [linkedChildren, linkedAdmissions, linkedEnrollments] = await Promise.all([
      tx.parentStudentMap.count({ where: { parentId } }),
      tx.admission.count({ where: { parentId } }),
      tx.enrollment.count({ where: { parentId } }),
    ]);

    if (linkedChildren > 0 || linkedAdmissions > 0 || linkedEnrollments > 0) {
      continue;
    }

    const parent = await tx.parent.findUnique({
      where: { id: parentId },
      select: { userId: true },
    });

    if (!parent) {
      continue;
    }

    await tx.leaveRequest.updateMany({
      where: { parentId },
      data: { parentId: null },
    });
    await tx.parent.delete({ where: { id: parentId } });
    await tx.user.delete({ where: { id: parent.userId } });
  }
}

export async function deleteAdmissionRecordCascade(tx: TxClient, admissionId: string) {
  const admission = await tx.admission.findUnique({
    where: { id: admissionId },
    select: {
      id: true,
      parentId: true,
      studentId: true,
    },
  });

  if (!admission) {
    return { deletedStudent: false, cleanedParentIds: [] as string[] };
  }

  if (admission.studentId) {
    const result = await deleteStudentRecordCascade(tx, admission.studentId);
    return { deletedStudent: true, cleanedParentIds: result.parentIds };
  }

  const parentIds = admission.parentId ? [admission.parentId] : [];

  await tx.notification.updateMany({
    where: { admissionId: admission.id },
    data: { admissionId: null },
  });
  await tx.applicationDocument.deleteMany({ where: { admissionId: admission.id } });
  await tx.admission.delete({ where: { id: admission.id } });
  await deleteOrphanParentRecords(tx, parentIds);

  return { deletedStudent: false, cleanedParentIds: parentIds };
}

export async function deleteStudentRecordCascade(tx: TxClient, studentId: string) {
  const student = await tx.student.findUnique({
    where: { id: studentId },
    include: {
      parentMaps: {
        select: { parentId: true },
      },
      admissions: {
        select: { id: true, parentId: true },
      },
      invoices: {
        select: { id: true },
      },
    },
  });

  if (!student) {
    return { parentIds: [] as string[], admissionIds: [] as string[] };
  }

  const admissionIds = student.admissions.map((admission) => admission.id);
  const invoiceIds = student.invoices.map((invoice) => invoice.id);
  const parentIds = [
    ...student.parentMaps.map((map) => map.parentId),
    ...student.admissions.map((admission) => admission.parentId).filter((parentId): parentId is string => Boolean(parentId)),
  ];

  if (admissionIds.length > 0) {
    await tx.notification.updateMany({
      where: { admissionId: { in: admissionIds } },
      data: { admissionId: null },
    });
    await tx.applicationDocument.deleteMany({
      where: { admissionId: { in: admissionIds } },
    });
    await tx.admission.deleteMany({
      where: { id: { in: admissionIds } },
    });
  }

  await tx.homeworkUpdateStudent.deleteMany({ where: { studentId } });
  await tx.attendance.deleteMany({ where: { studentId } });
  await tx.studentObservation.deleteMany({ where: { studentId } });
  await tx.leaveRequest.deleteMany({ where: { studentId } });
  await tx.enrollment.deleteMany({ where: { studentId } });
  await tx.receipt.deleteMany({ where: { studentId } });

  if (invoiceIds.length > 0) {
    const payments = await tx.payment.findMany({
      where: { invoiceId: { in: invoiceIds } },
      select: { id: true },
    });
    const paymentIds = payments.map((payment) => payment.id);

    if (paymentIds.length > 0) {
      await tx.notification.updateMany({
        where: { paymentId: { in: paymentIds } },
        data: { paymentId: null },
      });
    }

    await tx.payment.deleteMany({
      where: { invoiceId: { in: invoiceIds } },
    });
  }

  await tx.invoice.deleteMany({ where: { studentId } });
  await tx.parentStudentMap.deleteMany({ where: { studentId } });
  await tx.student.delete({ where: { id: studentId } });
  await deleteOrphanParentRecords(tx, parentIds);

  return { parentIds, admissionIds };
}
