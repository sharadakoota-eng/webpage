import { PageHero } from "@/components/sections/page-hero";
import { AdmissionForm } from "@/components/sections/admission-form";

export default function AdmissionsPage() {
  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Admissions"
        title="A simple, elegant admission flow designed for new families"
        description="The admissions experience supports enquiry, school visits, document collection, review status, and future parent portal onboarding."
      />
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          "Submit inquiry",
          "Book a school visit",
          "Complete admission form",
          "Receive review updates",
        ].map((step, index) => (
          <div key={step} className="rounded-[1.75rem] bg-white p-6 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Step {index + 1}</p>
            <h2 className="mt-3 font-display text-2xl text-navy">{step}</h2>
          </div>
        ))}
      </section>
      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-base leading-8 text-navy/75">
          Phase 1 includes enquiry intake and admission records. Phase 2 expands this into secure family logins, student records, and document tracking. Phase 3 adds payment-linked invoice and receipt workflows.
        </p>
      </section>
      <AdmissionForm />
    </div>
  );
}
