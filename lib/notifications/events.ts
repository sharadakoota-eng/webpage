import { NotificationType, RoleType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { notificationService } from "@/lib/notifications/service";
import { notificationTemplates } from "@/lib/notifications/templates";

async function getFrontDeskRecipients() {
  const users = await prisma.user.findMany({
    where: {
      role: {
        type: {
          in: [RoleType.ADMIN, RoleType.FRONT_DESK],
        },
      },
    },
    select: { id: true },
  });

  return users.map((user) => user.id);
}

export async function triggerNewInquiryEvent(params: {
  inquiryId: string;
  parentName: string;
  phone: string;
  programName?: string;
}) {
  const template = notificationTemplates.newInquiry(params);
  await notificationService.dispatch({
    ...template,
    type: NotificationType.INQUIRY,
    recipientUserIds: await getFrontDeskRecipients(),
    metadata: { inquiryId: params.inquiryId },
  });
}

export async function triggerAdmissionEvent(params: {
  admissionId: string;
  parentName: string;
  childName: string;
  phone: string;
}) {
  const template = notificationTemplates.newAdmission(params);
  await notificationService.dispatch({
    ...template,
    type: NotificationType.ADMISSION,
    recipientUserIds: await getFrontDeskRecipients(),
    metadata: { admissionId: params.admissionId },
  });
}

export async function triggerParentPortalReadyEvent(params: {
  admissionId: string;
  parentName: string;
  childName: string;
  phone: string;
  temporaryPassword?: string;
}) {
  await notificationService.dispatch({
    title: "Parent Portal Ready",
    message: `${params.parentName} can now access the parent portal for ${params.childName}. Contact: ${params.phone}.${params.temporaryPassword ? ` Temporary password: ${params.temporaryPassword}.` : ""}`,
    type: NotificationType.ADMISSION,
    recipientUserIds: await getFrontDeskRecipients(),
    metadata: { admissionId: params.admissionId, portalReady: true },
  });
}

export async function triggerAdmissionApprovedEvent(params: {
  admissionId: string;
  parentName: string;
  childName: string;
  phone: string;
}) {
  await notificationService.dispatch({
    title: "Admission Approved",
    message: `${params.parentName}'s admission for ${params.childName} has been approved. Contact: ${params.phone}.`,
    type: NotificationType.ADMISSION,
    recipientUserIds: await getFrontDeskRecipients(),
    metadata: { admissionId: params.admissionId, status: "APPROVED" },
  });
}

export async function triggerDocumentRejectedEvent(params: {
  admissionId: string;
  documentLabel: string;
  parentName: string;
  phone: string;
  reason?: string;
}) {
  await notificationService.dispatch({
    title: "Admission Document Rejected",
    message: `${params.documentLabel} for ${params.parentName} needs reupload.${params.reason ? ` Reason: ${params.reason}` : ""} Contact: ${params.phone}.`,
    type: NotificationType.ADMISSION,
    recipientUserIds: await getFrontDeskRecipients(),
    metadata: { admissionId: params.admissionId, documentLabel: params.documentLabel, reason: params.reason ?? null },
  });
}

export async function triggerPaymentCreatedEvent(params: {
  paymentId: string;
  invoiceNumber: string;
  parentName: string;
}) {
  const template = notificationTemplates.paymentSuccess({
    invoiceNumber: params.invoiceNumber,
    parentName: params.parentName,
  });

  await notificationService.dispatch({
    ...template,
    type: NotificationType.PAYMENT,
    recipientUserIds: await getFrontDeskRecipients(),
    metadata: { paymentId: params.paymentId, invoiceNumber: params.invoiceNumber },
  });
}

export async function triggerVisitBookingEvent(params: {
  bookingId: string;
  parentName: string;
  phone: string;
  visitDate: string;
}) {
  const template = notificationTemplates.visitBooking(params);
  await notificationService.dispatch({
    ...template,
    type: NotificationType.VISIT,
    recipientUserIds: await getFrontDeskRecipients(),
    metadata: { bookingId: params.bookingId },
  });
}

export async function triggerImportantContactEvent(params: {
  submissionId: string;
  name: string;
  subject?: string;
}) {
  const template = notificationTemplates.importantContact(params);
  await notificationService.dispatch({
    ...template,
    type: NotificationType.CONTACT,
    recipientUserIds: await getFrontDeskRecipients(),
    metadata: { submissionId: params.submissionId },
  });
}
