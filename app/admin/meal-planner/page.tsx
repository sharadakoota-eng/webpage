import { prisma } from "@/lib/prisma";
import { MealPlannerManager } from "@/components/portal/meal-planner-manager";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type MealPlannerEntry = {
  id: string;
  date: string;
  title: string;
  items: string[];
  note?: string;
  programIds: string[];
};

export default async function AdminMealPlannerPage() {
  const [setting, programs] = await Promise.all([
    prisma.setting.findUnique({
      where: { key: "meal_planner_entries" },
      select: { value: true },
    }),
    prisma.program.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const entries = ((setting?.value as MealPlannerEntry[] | undefined) ?? []).filter(Boolean);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Meal Planner</p>
        <h1 className="mt-2 font-display text-4xl text-navy">Course-wise food menu control</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-navy/68">
          Admin can publish today&apos;s meals program-wise so only the relevant parents see the correct menu inside their portal.
        </p>
      </section>

      <MealPlannerManager entries={entries} programs={programs} />
    </div>
  );
}
