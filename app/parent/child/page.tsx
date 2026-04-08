import { getPortalSession } from "@/lib/erp-auth";
import { getParentPortalData } from "@/lib/erp-data";
import { documentTypeLabelMap } from "@/lib/admissions";
import { ParentDocumentReuploadCard } from "@/components/portal/parent-document-reupload-card";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ParentChildPage() {
  const session = await getPortalSession();
  const parent = await getParentPortalData(session?.sub);
  const student = parent?.parentStudents[0]?.student;
  const currentEnrollment = student?.enrollments[0];
  const latestAdmission = student?.admissions[0];
  const familyProfile = ((latestAdmission?.familyProfile as Record<string, string | undefined> | undefined) ?? {});
  const address = [familyProfile.addressLine1, familyProfile.addressLine2, familyProfile.city, familyProfile.state, familyProfile.postalCode]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Child Profile</p>
        <h2 className="mt-3 font-display text-3xl text-navy">
          {student ? `${student.firstName} ${student.lastName ?? ""}` : "Student profile pending"}
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Admission No", value: student?.admissionNumber ?? "Not assigned" },
            { label: "Class", value: student?.currentClass?.name ?? "Not assigned" },
            { label: "Section", value: student?.currentClass?.section ?? "Not assigned" },
            {
              label: "Date of birth",
              value: student
                ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(student.dateOfBirth)
                : "Not available",
            },
            { label: "Gender", value: student?.gender ?? "Not available" },
            { label: "Blood group", value: student?.bloodGroup ?? "Not available" },
            { label: "Program", value: currentEnrollment?.program.name ?? "Not available" },
            { label: "Primary parent", value: parent?.user.name ?? "Not available" },
            { label: "Guardian", value: familyProfile.guardianName ?? "Not applicable" },
            { label: "Address", value: address || "Not available" },
            { label: "Teacher notes", value: `${student?.observations.length ?? 0}` },
            { label: "Receipts", value: `${student?.receipts.length ?? 0}` },
          ].map((item) => (
            <div key={item.label} className="rounded-[1.35rem] bg-cream px-5 py-4 shadow-card">
              <p className="text-xs uppercase tracking-[0.2em] text-navy/45">{item.label}</p>
              <p className="mt-2 text-sm font-medium text-navy">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Document Review</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {latestAdmission?.documents.length ? (
            latestAdmission.documents.map((document) => (
              <ParentDocumentReuploadCard
                key={document.id}
                admissionId={latestAdmission.id}
                documentId={document.id}
                label={documentTypeLabelMap[document.documentType]}
                status={document.status}
                notes={document.notes}
              />
            ))
          ) : (
            <div className="rounded-[1.35rem] bg-cream px-5 py-4 text-sm leading-7 text-navy/70 md:col-span-2 xl:col-span-3">
              Admission documents will appear here once the admission packet is linked to the student.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
