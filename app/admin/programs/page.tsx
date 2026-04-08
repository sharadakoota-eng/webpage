import { ProgramCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ProgramFeeManager } from "@/components/portal/program-fee-manager";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const categoryLabels: Record<ProgramCategory, string> = {
  CORE: "Montessori",
  DAYCARE: "Day Care",
  ENRICHMENT: "Enrichment",
  CAMP: "Camp",
  LANGUAGE: "Language",
};

export default async function AdminProgramsPage() {
  const programs = await prisma.program.findMany({
    orderBy: { name: "asc" },
    include: {
      feeStructures: {
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          enrollments: true,
          inquiries: true,
          admissions: true,
        },
      },
    },
  });

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Programs configured", value: programs.length.toString() },
          { label: "Pricing ready", value: programs.filter((program) => program.feeStructures.length > 0).length.toString() },
          { label: "Admission open", value: programs.filter((program) => program.isPublished).length.toString() },
          { label: "Live enrollments", value: programs.reduce((sum, program) => sum + program._count.enrollments, 0).toString() },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[1.75rem] bg-white p-6 shadow-card">
            <p className="text-sm text-navy/60">{stat.label}</p>
            <p className="mt-3 font-display text-4xl text-navy">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[2rem] bg-[linear-gradient(135deg,#0f2242_0%,#18325b_58%,#21406b_100%)] px-6 py-10 text-white shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">Programs & Fees</p>
        <h1 className="mt-3 font-display text-4xl">Program pricing should flow through admissions, parents, and payments automatically</h1>
        <p className="mt-3 max-w-4xl text-base leading-8 text-white/78">
          Manage Montessori, Day Care, Summer Camp, After School Activities, Creative Achievers, and Kannada Kasturi from one pricing desk. Fee structures defined here are the source of truth for admissions and finance views.
        </p>
      </section>

      <ProgramFeeManager
        programs={programs.map((program) => ({
          id: program.id,
          name: program.name,
          category: categoryLabels[program.category],
          ageGroup: program.ageGroup,
          schedule: program.schedule,
          isPublished: program.isPublished,
          feeStructures: program.feeStructures.map((fee) => ({
            id: fee.id,
            title: fee.title,
            frequency: fee.frequency,
            amount: fee.amount.toString(),
            description: fee.description,
          })),
        }))}
      />
    </div>
  );
}
