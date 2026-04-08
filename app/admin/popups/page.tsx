import { prisma } from "@/lib/prisma";
import { SpecialPopupForm } from "@/components/portal/special-popup-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPopupsPage() {
  const popupSetting = await prisma.setting.findUnique({
    where: { key: "special_event_popup" },
    select: { value: true },
  });

  const popup = (popupSetting?.value as
    | {
        enabled?: boolean;
        title?: string;
        message?: string;
        buttonLabel?: string;
        buttonUrl?: string;
        audience?: string;
      }
    | undefined) ?? {
    enabled: false,
    title: "",
    message: "",
    buttonLabel: "Explore",
    buttonUrl: "/events",
    audience: "ALL",
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Popups & Alerts</p>
        <h1 className="mt-2 font-display text-4xl text-navy">Manage site-wide popup campaigns</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-navy/68">
          Use this page for admissions drives, holiday closures, orientation alerts, and high-priority announcements that should be visible across the website and selected portals.
        </p>
      </section>

      <SpecialPopupForm
        initialState={{
          enabled: popup.enabled ?? false,
          title: popup.title ?? "",
          message: popup.message ?? "",
          buttonLabel: popup.buttonLabel ?? "Explore",
          buttonUrl: popup.buttonUrl ?? "/events",
          audience: popup.audience ?? "ALL",
        }}
      />
    </div>
  );
}
