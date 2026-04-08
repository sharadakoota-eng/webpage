import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { RoleType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePortalRole } from "@/lib/erp-auth";

const plannerEntrySchema = z.object({
  date: z.string().min(1),
  title: z.string().min(2),
  items: z.array(z.string().min(1)).min(1),
  note: z.string().optional().or(z.literal("")),
  programIds: z.array(z.string()).default([]),
});

const payloadSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("save"),
    entry: plannerEntrySchema,
  }),
  z.object({
    action: z.literal("delete"),
    id: z.string().min(1),
  }),
]);

type MealPlannerEntry = z.infer<typeof plannerEntrySchema> & { id: string };

export async function POST(request: Request) {
  const session = await requirePortalRole([RoleType.ADMIN, RoleType.SUPER_ADMIN]);
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = payloadSchema.parse(await request.json());
    const existingSetting = await prisma.setting.findUnique({
      where: { key: "meal_planner_entries" },
      select: { value: true },
    });

    const existingEntries = ((existingSetting?.value as MealPlannerEntry[] | undefined) ?? []).filter(Boolean);

    const nextEntries =
      payload.action === "delete"
        ? existingEntries.filter((entry) => entry.id !== payload.id)
        : [
            ...existingEntries.filter((entry) => entry.date !== payload.entry.date),
            {
              id: randomUUID(),
              ...payload.entry,
              note: payload.entry.note || "",
            },
          ].sort((a, b) => a.date.localeCompare(b.date));

    await prisma.setting.upsert({
      where: { key: "meal_planner_entries" },
      update: {
        description: "Course-wise meal planning for parent and teacher portals.",
        value: nextEntries,
      },
      create: {
        key: "meal_planner_entries",
        description: "Course-wise meal planning for parent and teacher portals.",
        value: nextEntries,
      },
    });

    if (payload.action === "save") {
      await prisma.setting.upsert({
        where: { key: "today_lunch_menu" },
        update: {
          value: {
            title: payload.entry.title,
            items: payload.entry.items,
            note: payload.entry.note || "Updated by the school admin team.",
          },
        },
        create: {
          key: "today_lunch_menu",
          description: "Fallback lunch menu visible across the parent portal.",
          value: {
            title: payload.entry.title,
            items: payload.entry.items,
            note: payload.entry.note || "Updated by the school admin team.",
          },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: error.issues[0]?.message ?? "Invalid meal planner payload." }, { status: 400 });
    }

    return NextResponse.json({ success: false, message: "Unable to update meal planner." }, { status: 400 });
  }
}
