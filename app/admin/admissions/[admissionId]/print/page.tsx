import Image from "next/image";
import { notFound } from "next/navigation";
import logo from "@/assets/logo.png";
import { PrintPacketButton } from "@/components/portal/print-packet-button";
import { prisma } from "@/lib/prisma";
import { documentStatusLabelMap, documentTypeLabelMap, formatFamilyAddress, getPrimaryParentEmail, getPrimaryParentPhone, primaryParentLabelMap } from "@/lib/admissions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(value);
}

function asRecord<T>(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as T) : null;
}

export default async function AdminAdmissionPrintPage({ params }: { params: Promise<{ admissionId: string }> }) {
  const { admissionId } = await params;
  const admission = await prisma.admission.findUnique({
    where: { id: admissionId },
    include: { program: true, documents: true },
  });

  if (!admission) notFound();

  const familyProfile = asRecord<Record<string, string | undefined>>(admission.familyProfile);
  const childProfile = asRecord<Record<string, string | undefined>>(admission.childProfile);
  const operationalProfile = asRecord<Record<string, string | undefined>>(admission.admissionProfile);

  return (
    <div className="mx-auto max-w-5xl bg-white p-8 text-navy print:p-5">
      <div className="rounded-[2rem] border border-[#eadfc7] bg-[linear-gradient(135deg,#fffaf0_0%,#f8f1e4_100%)] p-8">
        <div className="flex items-start justify-between gap-6 border-b border-[#e9dcc4] pb-6">
          <div className="flex items-start gap-4">
            <div className="overflow-hidden rounded-[1.4rem] border border-[#e3d5b7] bg-white p-2">
              <Image src={logo} alt="Sharada Koota Montessori logo" className="h-16 w-16 object-contain" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-gold">Sharada Koota Montessori</p>
              <h1 className="mt-2 font-display text-4xl">Admission Packet</h1>
              <p className="mt-2 text-sm text-navy/68">Application {admission.applicationNumber} | {admission.status.replaceAll("_", " ")}</p>
              <p className="text-sm text-navy/58">Print this packet for parent signature, school verification, and office archive.</p>
            </div>
          </div>
          <PrintPacketButton className="rounded-full border border-navy/10 px-4 py-2 text-sm font-semibold text-navy print:hidden" />
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className="rounded-[1.4rem] bg-white/90 p-5">
            <h2 className="text-lg font-semibold">Child Details</h2>
            <div className="mt-4 space-y-2 text-sm leading-7">
              <p><strong>Name:</strong> {admission.childName}</p>
              <p><strong>Date of birth:</strong> {formatDate(admission.childDob)}</p>
              <p><strong>Gender:</strong> {childProfile?.gender ?? "Pending"}</p>
              <p><strong>Blood group:</strong> {childProfile?.bloodGroup ?? "Pending"}</p>
              <p><strong>Previous school:</strong> {childProfile?.previousSchool ?? "Pending"}</p>
              <p><strong>Previous grade:</strong> {childProfile?.previousGrade ?? "Pending"}</p>
              <p><strong>Program:</strong> {admission.program?.name ?? "Pending"}</p>
            </div>
          </section>

          <section className="rounded-[1.4rem] bg-white/90 p-5">
            <h2 className="text-lg font-semibold">Parent Details</h2>
            <div className="mt-4 space-y-2 text-sm leading-7">
              <p><strong>Primary parent:</strong> {familyProfile?.primaryParent ? primaryParentLabelMap[familyProfile.primaryParent as "FATHER" | "MOTHER"] : "Pending"}</p>
              <p><strong>Portal contact:</strong> {admission.parentName}</p>
              <p><strong>Phone:</strong> {getPrimaryParentPhone(familyProfile as never, admission.phone)}</p>
              <p><strong>Email:</strong> {getPrimaryParentEmail(familyProfile as never, admission.email)}</p>
              <p><strong>Father:</strong> {familyProfile?.fatherName ?? "Pending"} | {familyProfile?.fatherPhone ?? "Pending"}</p>
              <p><strong>Mother:</strong> {familyProfile?.motherName ?? "Pending"} | {familyProfile?.motherPhone ?? "Pending"}</p>
              <p><strong>Guardian:</strong> {familyProfile?.guardianName ?? "Not provided"} | {familyProfile?.guardianPhone ?? "Pending"}</p>
              <p><strong>Address:</strong> {formatFamilyAddress(familyProfile as never)}</p>
            </div>
          </section>

          <section className="rounded-[1.4rem] bg-white/90 p-5">
            <h2 className="text-lg font-semibold">Admission Notes</h2>
            <div className="mt-4 space-y-2 text-sm leading-7">
              <p><strong>Submitted:</strong> {admission.submittedAt ? formatDate(admission.submittedAt) : formatDate(admission.createdAt)}</p>
              <p><strong>Approved:</strong> {admission.approvedAt ? formatDate(admission.approvedAt) : "Pending"}</p>
              <p><strong>Preferred joining month:</strong> {operationalProfile?.preferredStartMonth ?? "Pending"}</p>
              <p><strong>Visit status:</strong> {operationalProfile?.schoolVisitStatus ?? "Pending"}</p>
              <p><strong>Summary:</strong> {admission.notes ?? "No summary notes available."}</p>
              <p><strong>Review notes:</strong> {admission.reviewNotes ?? "No review notes recorded."}</p>
            </div>
          </section>

          <section className="rounded-[1.4rem] bg-white/90 p-5">
            <h2 className="text-lg font-semibold">Document Checklist</h2>
            <div className="mt-4 space-y-2 text-sm leading-7">
              {admission.documents.map((document) => (
                <p key={document.id}>
                  <strong>{documentTypeLabelMap[document.documentType]}:</strong> {documentStatusLabelMap[document.status]} | {document.fileName}
                </p>
              ))}
              {admission.documents.length === 0 ? <p>No documents uploaded yet.</p> : null}
            </div>
          </section>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-[1.4rem] border border-dashed border-[#ccb88b] bg-white/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Parent Signature</p>
            <div className="mt-12 border-b border-navy/30" />
          </div>
          <div className="rounded-[1.4rem] border border-dashed border-[#ccb88b] bg-white/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">School Verification</p>
            <div className="mt-12 border-b border-navy/30" />
          </div>
          <div className="rounded-[1.4rem] border border-dashed border-[#ccb88b] bg-white/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">School Seal / Stamp</p>
            <div className="mt-8 flex h-20 items-center justify-center rounded-[1rem] border border-dashed border-navy/20 text-xs text-navy/45">
              Stamp here
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
