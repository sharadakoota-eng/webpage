import { prisma } from "@/lib/prisma";
import { getAdmissionFormConfig } from "@/lib/admin-config";
import { AdmissionWorkbench } from "@/components/portal/admission-workbench";
import { admissionPipelineStageLabelMap, deriveAdmissionPipelineStage, documentStatusLabelMap } from "@/lib/admissions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

export default async function AdminAdmissionsPage() {
  const [admissions, programs, formConfig] = await Promise.all([
    prisma.admission.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        program: {
          include: {
            feeStructures: {
              orderBy: { createdAt: "desc" },
              take: 2,
            },
          },
        },
        documents: {
          select: { id: true, documentType: true, status: true, fileName: true, fileUrl: true, notes: true },
        },
      },
      take: 50,
    }),
    prisma.program.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    getAdmissionFormConfig(),
  ]);

  const pipelineCounts = admissions.reduce(
    (acc, item) => {
      const stage = deriveAdmissionPipelineStage({
        status: item.status,
        parentId: item.parentId,
        studentId: item.studentId,
        enrolledAt: item.enrolledAt,
      });
      acc[stage] += 1;
      return acc;
    },
    { SUBMITTED: 0, UNDER_REVIEW: 0, APPROVED: 0, REJECTED: 0, ENROLLED: 0 } satisfies Record<keyof typeof admissionPipelineStageLabelMap, number>,
  );

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Submitted", value: pipelineCounts.SUBMITTED.toString() },
          { label: "Under review", value: pipelineCounts.UNDER_REVIEW.toString() },
          { label: "Approved", value: pipelineCounts.APPROVED.toString() },
          { label: "Rejected", value: pipelineCounts.REJECTED.toString() },
          { label: "Enrolled", value: pipelineCounts.ENROLLED.toString() },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[1.75rem] bg-white p-6 shadow-card">
            <p className="text-sm text-navy/60">{stat.label}</p>
            <p className="mt-3 font-display text-4xl text-navy">{stat.value}</p>
          </div>
        ))}
      </section>

      <AdmissionWorkbench
        admissions={admissions.map((item) => ({
          id: item.id,
          applicationNumber: item.applicationNumber,
          shareToken: item.shareToken,
          parentName: item.parentName,
          childName: item.childName,
          phone: item.phone,
          email: item.email,
          status: item.status,
          notes: item.notes,
          reviewNotes: item.reviewNotes,
          studentId: item.studentId,
          parentId: item.parentId,
          createdAtLabel: formatDate(item.createdAt),
          submittedAtLabel: item.submittedAt ? formatDate(item.submittedAt) : null,
          approvedAtLabel: item.approvedAt ? formatDate(item.approvedAt) : null,
          enrolledAtLabel: item.enrolledAt ? formatDate(item.enrolledAt) : null,
          portalAccessSentAtLabel: item.portalAccessSentAt ? formatDate(item.portalAccessSentAt) : null,
          programId: item.programId,
          programName: item.program?.name,
          submittedByParent: item.submittedByParent,
          childProfile: item.childProfile,
          familyProfile: item.familyProfile,
          admissionProfile: item.admissionProfile,
          documentsCount: item.documents.length,
          verifiedDocumentsCount: item.documents.filter((doc) => doc.status === "VERIFIED").length,
          pendingDocumentsCount: item.documents.filter((doc) => ["REQUESTED", "REJECTED"].includes(doc.status)).length,
          pipelineStage: deriveAdmissionPipelineStage({
            status: item.status,
            parentId: item.parentId,
            studentId: item.studentId,
            enrolledAt: item.enrolledAt,
          }),
          pipelineStageLabel: admissionPipelineStageLabelMap[
            deriveAdmissionPipelineStage({
              status: item.status,
              parentId: item.parentId,
              studentId: item.studentId,
              enrolledAt: item.enrolledAt,
            })
          ],
          documents: item.documents.map((doc) => ({
            id: doc.id,
            documentType: doc.documentType,
            status: doc.status,
            fileName: doc.fileName,
            fileUrl: doc.fileUrl,
            notes: doc.notes,
            statusLabel: documentStatusLabelMap[doc.status],
          })),
          feePreview:
            item.program?.feeStructures.length
              ? `Fee plans ${item.program.feeStructures.map((fee) => `Rs. ${fee.amount.toString()}`).join(" / ")}`
              : "Fee plan pending",
        }))}
        programs={programs}
        formConfig={formConfig}
      />
    </div>
  );
}
