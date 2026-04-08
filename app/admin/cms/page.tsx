import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminCmsPage() {
  const [announcements, events, galleryItems, testimonials] = await Promise.all([
    prisma.announcement.count(),
    prisma.event.count(),
    prisma.galleryItem.count(),
    prisma.testimonial.count(),
  ]);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Announcements", value: announcements.toString() },
          { label: "Events", value: events.toString() },
          { label: "Gallery items", value: galleryItems.toString() },
          { label: "Testimonials", value: testimonials.toString() },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[1.75rem] bg-white p-6 shadow-card">
            <p className="text-sm text-navy/60">{stat.label}</p>
            <p className="mt-3 font-display text-4xl text-navy">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Website CMS</p>
        <h2 className="mt-2 font-display text-3xl text-navy">Content control for homepage, banners, gallery, popup, and announcements</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { title: "Announcements & lunch menu", href: "/admin/updates", copy: "Publish notices, control lunch menu, and manage special popup visibility." },
            { title: "Programs & pricing", href: "/admin/programs", copy: "Keep program content and fee structures aligned with admissions and parent portal." },
            { title: "Admissions forms", href: "/admin/admissions", copy: "Control admission form visibility, fields, and enrollment conversion logic." },
            { title: "School settings", href: "/admin/settings", copy: "Update school profile, contact details, and configuration defaults." },
          ].map((item) => (
            <Link key={item.title} href={item.href} className="rounded-[1.45rem] border border-navy/10 bg-[#fcfaf6] p-5 transition hover:-translate-y-0.5">
              <p className="font-display text-2xl text-navy">{item.title}</p>
              <p className="mt-3 text-sm leading-7 text-navy/68">{item.copy}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
