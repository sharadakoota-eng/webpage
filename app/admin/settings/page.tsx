import { getSchoolProfileSetting } from "@/lib/admin-config";
import { ChangePasswordCard } from "@/components/portal/change-password-card";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSettingsPage() {
  const schoolProfile = await getSchoolProfileSetting();

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Settings</p>
        <h2 className="mt-2 font-display text-3xl text-navy">School profile, academic defaults, and system configuration</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            { label: "School", value: schoolProfile.name ?? "Sharada Koota Montessori" },
            { label: "Tagline", value: schoolProfile.tagline ?? "A House of Learning" },
            { label: "Academic year", value: schoolProfile.academicYear ?? "2026-2027" },
            { label: "Campus", value: schoolProfile.defaultCampus ?? "HSR Layout" },
            { label: "Email", value: schoolProfile.email ?? "Not configured" },
            { label: "Phones", value: (schoolProfile.phoneNumbers ?? []).join(", ") || "Not configured" },
          ].map((item) => (
            <div key={item.label} className="rounded-[1.35rem] bg-cream px-5 py-4 shadow-card">
              <p className="text-xs uppercase tracking-[0.2em] text-navy/45">{item.label}</p>
              <p className="mt-2 text-sm font-medium text-navy">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[1.4rem] border border-navy/10 bg-[#fbf7f0] px-5 py-4 text-sm leading-7 text-navy/68">
          This module is ready to become the place for school profile editing, academic year setup, notification settings, payment settings, and portal permissions.
        </div>
      </section>

      <ChangePasswordCard
        title="Change admin password"
        description="Use this desk to update your admin login password. If another staff member forgets a password, use the reset controls from the relevant admin, teacher, or parent record."
      />
    </div>
  );
}
