import { AdmissionStatus, ApplicationDocumentStatus, DocumentType } from "@prisma/client";
import { documentStatusLabelMap, documentTypeLabelMap } from "@/lib/admissions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDocumentsPage() {
  const [admissions, documents] = await Promise.all([
    prisma.admission.findMany({
      orderBy: { createdAt: "desc" },
      include: { program: true, documents: true },
      take: 30,
    }),
    prisma.applicationDocument.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { documentType: true, status: true },
    }),
  ]);

  const pendingAdmissions = admissions.filter((admission) => admission.status === AdmissionStatus.DOCUMENTS_PENDING).length;
  const withDocuments = admissions.filter((admission) => admission.documents.length > 0).length;
  const withoutDocuments = admissions.filter((admission) => admission.documents.length === 0).length;

  const documentCounts = documents.reduce<Record<DocumentType, number>>((acc, item) => {
    acc[item.documentType] = (acc[item.documentType] ?? 0) + 1;
    return acc;
  }, {
    BIRTH_CERTIFICATE: 0,
    CHILD_AADHAAR: 0,
    FATHER_AADHAAR: 0,
    MOTHER_AADHAAR: 0,
    ID_PROOF: 0,
    ADDRESS_PROOF: 0,
    MEDICAL_RECORD: 0,
    PHOTO: 0,
    PREVIOUS_SCHOOL_RECORD: 0,
    OTHER: 0,
  });

  const statusCounts = documents.reduce<Record<ApplicationDocumentStatus, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {
    REQUESTED: 0,
    UPLOADED: 0,
    VERIFIED: 0,
    REJECTED: 0,
  });

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Admission files", value: admissions.length.toString() },
          { label: "Documents pending", value: pendingAdmissions.toString() },
          { label: "With uploads", value: withDocuments.toString() },
          { label: "Without uploads", value: withoutDocuments.toString() },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[1.75rem] bg-white p-6 shadow-card">
            <p className="text-sm text-navy/60">{stat.label}</p>
            <p className="mt-3 font-display text-4xl text-navy">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Document Desk</p>
          <h2 className="mt-2 font-display text-3xl text-navy">Keep Aadhaar, birth certificate, and school records in one verified place</h2>
          <div className="mt-6 space-y-4">
            {admissions.map((admission) => (
              <div key={admission.id} className="rounded-[1.45rem] border border-navy/10 px-5 py-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold text-navy">{admission.childName}</p>
                    <p className="mt-2 text-sm leading-7 text-navy/70">Parent: {admission.parentName} | Program: {admission.program?.name ?? "Program pending"}</p>
                    <p className="text-sm leading-7 text-navy/60">Application: {admission.applicationNumber} | {admission.documents.length} document(s) uploaded</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-cream px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">{admission.status.replaceAll("_", " ")}</span>
                    <span className="rounded-full bg-[#eef6ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1d4ed8]">{admission.documents.length > 0 ? "Uploads received" : "Uploads pending"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] bg-sky p-8 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Required Checklist</p>
            <div className="mt-5 grid gap-3">
              {Object.entries(documentCounts).map(([type, count]) => (
                <div key={type} className="rounded-[1.35rem] bg-white px-5 py-4 shadow-card">
                  <p className="text-sm font-semibold text-navy">{documentTypeLabelMap[type as DocumentType]}</p>
                  <p className="mt-2 text-sm text-navy/65">{count} file(s) uploaded so far</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-8 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Verification States</p>
            <div className="mt-5 space-y-3">
              {Object.entries(statusCounts).map(([state, count]) => (
                <div key={state} className="rounded-[1.3rem] bg-cream px-4 py-4 text-sm leading-7 text-navy/74">
                  {documentStatusLabelMap[state as ApplicationDocumentStatus]}: {count}
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
