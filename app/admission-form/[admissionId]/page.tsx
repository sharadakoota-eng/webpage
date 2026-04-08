import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import logo from "@/assets/logo.png";
import { getAdmissionDocumentBundle } from "@/lib/admission-packet";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdmissionFormPreviewPage({ params }: { params: Promise<{ admissionId: string }> }) {
  const { admissionId } = await params;
  const bundle = await getAdmissionDocumentBundle(admissionId);

  if (!bundle) notFound();

  const { parentApplication } = bundle;

  return (
    <div className="min-h-screen bg-[#f7f2e8] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-[#eadfc7] bg-[linear-gradient(135deg,#fffaf0_0%,#f8f1e4_100%)] p-8 shadow-card">
        <div className="flex flex-col gap-4 border-b border-[#e9dcc4] pb-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="overflow-hidden rounded-[1.4rem] border border-[#e3d5b7] bg-white p-2">
              <Image src={logo} alt="Sharada Koota Montessori logo" className="h-16 w-16 object-contain" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-gold">Sharada Koota Montessori</p>
              <h1 className="mt-2 font-display text-4xl text-navy">Admission Form</h1>
              <p className="mt-2 text-sm text-navy/68">
                Application {parentApplication.applicationNumber} | Submitted on {parentApplication.submittedOn}
              </p>
              <p className="text-sm font-medium text-gold">{parentApplication.statusLabel}</p>
              <p className="text-sm text-navy/58">Parent application copy for admission records.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href={`/admin/admissions/${admissionId}`} className="rounded-full border border-navy/10 px-4 py-2 text-sm font-semibold text-navy">
              Back to admission
            </Link>
            <a
              href={`/api/admin/admissions/${admissionId}/pdf`}
              className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white"
            >
              Download admission form
            </a>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {[
            { title: "Child Profile", rows: parentApplication.childProfile },
            { title: "Program Selection", rows: parentApplication.programSelection },
            { title: "Parent & Guardian Details", rows: parentApplication.parentGuardianDetails },
            { title: "Previous School Details", rows: parentApplication.previousSchoolDetails },
            { title: "Admission Preferences", rows: parentApplication.admissionPreferences },
            { title: "Address & Emergency", rows: parentApplication.addressDetails },
          ].map((section) => (
            <section key={section.title} className="rounded-[1.4rem] bg-white/90 p-5">
              <h2 className="text-lg font-semibold text-navy">{section.title}</h2>
              <div className="mt-4 space-y-2 text-sm leading-7 text-navy/80">
                {section.rows.length ? section.rows.map(([label, value]) => (
                  <p key={label}>
                    <strong>{label}:</strong> {value}
                  </p>
                )) : <p className="text-sm text-navy/60">No additional details.</p>}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-8 rounded-[1.4rem] bg-white/90 p-5">
          <h2 className="text-lg font-semibold text-navy">Submitted Document Checklist</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {parentApplication.submittedDocuments.length > 0 ? (
              parentApplication.submittedDocuments.map((documentLabel) => (
                <div key={documentLabel} className="rounded-[1rem] border border-navy/10 px-4 py-3 text-sm text-navy/78">
                  <strong>{documentLabel}</strong>
                </div>
              ))
            ) : (
              <p className="text-sm text-navy/60">No documents uploaded yet.</p>
            )}
          </div>
        </section>

        <section className="mt-8 rounded-[1.4rem] bg-white/90 p-5">
          <h2 className="text-lg font-semibold text-navy">Parent Declaration</h2>
          <p className="mt-4 text-sm leading-7 text-navy/76">{parentApplication.declaration}</p>
        </section>

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
