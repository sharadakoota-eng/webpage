import Link from "next/link";
import { notFound } from "next/navigation";
import { AdmissionRecordDesk } from "@/components/portal/admission-record-desk";
import { DocumentDownloadButton } from "@/components/portal/document-download-button";
import { prisma } from "@/lib/prisma";
import { admissionPipelineStageLabelMap, deriveAdmissionPipelineStage } from "@/lib/admissions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(value);
}

function asRecord<T>(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as T) : null;
}

export default async function AdminAdmissionDetailPage({ params }: { params: Promise<{ admissionId: string }> }) {
  const { admissionId } = await params;
  const admission = await prisma.admission.findUnique({
    where: { id: admissionId },
    include: {
      program: { include: { feeStructures: true } },
      documents: { orderBy: { createdAt: "asc" } },
      parent: { include: { user: true } },
      student: {
        include: {
          currentClass: {
            include: {
              classTeachers: {
                include: {
                  teacher: {
                    include: { user: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!admission) notFound();

  const [programs, classes] = await Promise.all([
    prisma.program.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.class.findMany({
      orderBy: [{ name: "asc" }, { section: "asc" }],
      include: {
        classTeachers: {
          include: {
            teacher: {
              include: { user: true },
            },
          },
        },
      },
    }),
  ]);

  const familyProfile = asRecord<Record<string, string | undefined>>(admission.familyProfile);
  const childProfile = asRecord<Record<string, string | undefined>>(admission.childProfile);
  const operationalProfile = asRecord<Record<string, string | boolean | undefined>>(admission.admissionProfile);
  const communicationLog = asRecord<Record<string, string | boolean | undefined>>(admission.communicationLog);
  const installmentPlan =
    operationalProfile && typeof operationalProfile.installmentPlan === "object" && operationalProfile.installmentPlan
      ? (operationalProfile.installmentPlan as { count?: number; dueDates?: string[] })
      : null;
  const pipelineStage = deriveAdmissionPipelineStage({
    status: admission.status,
    parentId: admission.parentId,
    studentId: admission.studentId,
    enrolledAt: admission.enrolledAt,
  });

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Admission Record</p>
            <h1 className="mt-2 font-display text-4xl text-navy">{admission.childName}</h1>
            <p className="mt-3 text-sm leading-7 text-navy/68">See the entire admission like a premium profile sheet, update each section in place, and complete enrollment only after the record is verified.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/admissions" className="rounded-full border border-navy/10 px-4 py-2 text-sm font-semibold text-navy">Back to admissions</Link>
            <DocumentDownloadButton
              href={`/api/admin/admissions/${admission.id}/pdf`}
              filename={`${admission.applicationNumber}-application.pdf`}
              variant="primary"
            >
              Download application PDF
            </DocumentDownloadButton>
            {pipelineStage === "ENROLLED" ? (
              <DocumentDownloadButton
                href={`/api/admin/admissions/${admission.id}/confirmation-pdf`}
                filename={`${admission.applicationNumber}-confirmation.pdf`}
              >
                Download confirmation PDF
              </DocumentDownloadButton>
            ) : null}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="rounded-full bg-[#f5f7fb] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-navy/72">
            {admission.applicationNumber}
          </div>
          <div className="rounded-full bg-[#f5f7fb] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-navy/72">
            {admissionPipelineStageLabelMap[pipelineStage]}
          </div>
        </div>
      </section>

      <AdmissionRecordDesk
        admissionId={admission.id}
        applicationNumber={admission.applicationNumber}
        currentStatus={admission.status}
        parentId={admission.parentId}
        studentId={admission.studentId}
        enrolledAtLabel={admission.enrolledAt ? formatDate(admission.enrolledAt) : null}
        submittedAtLabel={admission.submittedAt ? formatDate(admission.submittedAt) : formatDate(admission.createdAt)}
        approvedAtLabel={admission.approvedAt ? formatDate(admission.approvedAt) : null}
        currentProgramId={admission.programId}
        currentClassId={admission.student?.currentClassId}
        reviewNotes={admission.reviewNotes}
        programs={programs}
        classes={classes.map((entry) => {
          const currentLead = entry.classTeachers.find((item) => item.isLead) ?? entry.classTeachers[0];
          return {
            id: entry.id,
            label: `${entry.name}${entry.section ? ` - ${entry.section}` : ""}`,
            leadTeacher: currentLead?.teacher.user.name,
          };
        })}
        portalAccessSentAtLabel={admission.portalAccessSentAt ? formatDate(admission.portalAccessSentAt) : null}
        preferredStartMonth={typeof operationalProfile?.preferredStartMonth === "string" ? operationalProfile.preferredStartMonth : undefined}
        schoolVisitStatus={typeof operationalProfile?.schoolVisitStatus === "string" ? operationalProfile.schoolVisitStatus : undefined}
        initialInstallmentCount={typeof installmentPlan?.count === "number" ? installmentPlan.count : undefined}
        initialInstallmentDates={Array.isArray(installmentPlan?.dueDates) ? installmentPlan?.dueDates : undefined}
        documents={admission.documents.map((document) => ({
          id: document.id,
          documentType: document.documentType,
          status: document.status,
          fileUrl: document.fileUrl,
          fileName: document.fileName,
          notes: document.notes,
        }))}
        initialValues={{
          parentName: admission.parentName,
          phone: admission.phone,
          email: admission.email ?? "",
          childName: admission.childName,
          childDob: admission.childDob.toISOString().slice(0, 10),
          childGender: typeof childProfile?.gender === "string" ? childProfile.gender : "",
          childBloodGroup: typeof childProfile?.bloodGroup === "string" ? childProfile.bloodGroup : "",
          previousSchool: typeof childProfile?.previousSchool === "string" ? childProfile.previousSchool : "",
          previousGrade: typeof childProfile?.previousGrade === "string" ? childProfile.previousGrade : "",
          fatherName: typeof familyProfile?.fatherName === "string" ? familyProfile.fatherName : "",
          fatherPhone: typeof familyProfile?.fatherPhone === "string" ? familyProfile.fatherPhone : "",
          motherName: typeof familyProfile?.motherName === "string" ? familyProfile.motherName : "",
          motherPhone: typeof familyProfile?.motherPhone === "string" ? familyProfile.motherPhone : "",
          guardianName: typeof familyProfile?.guardianName === "string" ? familyProfile.guardianName : "",
          guardianPhone: typeof familyProfile?.guardianPhone === "string" ? familyProfile.guardianPhone : "",
          addressLine1: typeof familyProfile?.addressLine1 === "string" ? familyProfile.addressLine1 : "",
          addressLine2: typeof familyProfile?.addressLine2 === "string" ? familyProfile.addressLine2 : "",
          city: typeof familyProfile?.city === "string" ? familyProfile.city : "",
          state: typeof familyProfile?.state === "string" ? familyProfile.state : "",
          postalCode: typeof familyProfile?.postalCode === "string" ? familyProfile.postalCode : "",
          emergencyContactName: typeof familyProfile?.emergencyContactName === "string" ? familyProfile.emergencyContactName : "",
          emergencyContactPhone: typeof familyProfile?.emergencyContactPhone === "string" ? familyProfile.emergencyContactPhone : "",
          emergencyRelationship: typeof familyProfile?.emergencyRelationship === "string" ? familyProfile.emergencyRelationship : "",
          preferredStartMonth: typeof operationalProfile?.preferredStartMonth === "string" ? operationalProfile.preferredStartMonth : "",
          schoolVisitStatus: typeof operationalProfile?.schoolVisitStatus === "string" ? operationalProfile.schoolVisitStatus : "",
          parentExpectations: typeof operationalProfile?.parentExpectations === "string" ? operationalProfile.parentExpectations : "",
          notes: admission.notes ?? "",
          primaryParent: typeof familyProfile?.primaryParent === "string" ? familyProfile.primaryParent : "FATHER",
        }}
      />
    </div>
  );
}
