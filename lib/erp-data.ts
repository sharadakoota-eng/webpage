import { AdmissionStatus, InquiryStatus, NotificationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type LeadFeedItem = {
  id: string;
  type: "Inquiry" | "Admission" | "Visit" | "Contact";
  title: string;
  parentName: string;
  childName?: string | null;
  phone?: string | null;
  status: string;
  createdAt: Date;
};

export async function getAdminDashboardData() {
  const [inquiryCount, admissionCount, visitCount, notificationCount, inquiries, admissions, visits, contacts] = await Promise.all([
    prisma.inquiry.count({ where: { status: InquiryStatus.NEW } }),
    prisma.admission.count({ where: { status: { in: [AdmissionStatus.SUBMITTED, AdmissionStatus.UNDER_REVIEW, AdmissionStatus.DOCUMENTS_PENDING] } } }),
    prisma.visitBooking.count(),
    prisma.notification.count({ where: { status: { in: [NotificationStatus.QUEUED, NotificationStatus.RETRYING] } } }),
    prisma.inquiry.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        parentName: true,
        childName: true,
        phone: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.admission.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        parentName: true,
        childName: true,
        phone: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.visitBooking.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        parentName: true,
        childName: true,
        phone: true,
        createdAt: true,
      },
    }),
    prisma.contactSubmission.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        phone: true,
        createdAt: true,
      },
    }),
  ]);

  const leadFeed: LeadFeedItem[] = [
    ...inquiries.map((item) => ({
      id: item.id,
      type: "Inquiry" as const,
      title: "Website inquiry received",
      parentName: item.parentName,
      childName: item.childName,
      phone: item.phone,
      status: item.status.replaceAll("_", " "),
      createdAt: item.createdAt,
    })),
    ...admissions.map((item) => ({
      id: item.id,
      type: "Admission" as const,
      title: "Admission form submitted",
      parentName: item.parentName,
      childName: item.childName,
      phone: item.phone,
      status: item.status.replaceAll("_", " "),
      createdAt: item.createdAt,
    })),
    ...visits.map((item) => ({
      id: item.id,
      type: "Visit" as const,
      title: "School visit booking created",
      parentName: item.parentName,
      childName: item.childName,
      phone: item.phone,
      status: "Visit requested",
      createdAt: item.createdAt,
    })),
    ...contacts.map((item) => ({
      id: item.id,
      type: "Contact" as const,
      title: "Contact form submitted",
      parentName: item.name,
      childName: null,
      phone: item.phone,
      status: "New message",
      createdAt: item.createdAt,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10);

  return {
    stats: {
      inquiryCount,
      admissionCount,
      visitCount,
      notificationCount,
    },
    leadFeed,
  };
}

export async function getSchoolUpdatesSnapshot() {
  const [announcements, events, lunchMenuSetting] = await Promise.all([
    prisma.announcement.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, title: true, content: true, createdAt: true },
    }),
    prisma.event.findMany({
      where: { isPublished: true },
      orderBy: { startsAt: "asc" },
      take: 4,
      select: { id: true, title: true, description: true, startsAt: true, location: true },
    }),
    prisma.setting.findUnique({
      where: { key: "today_lunch_menu" },
      select: { value: true },
    }),
  ]);

  const lunchMenu =
    (lunchMenuSetting?.value as
      | {
          title?: string;
          items?: string[];
          note?: string;
        }
      | undefined) ?? {
      title: "Today's Lunch Menu",
      items: ["Vegetable pulao", "Curd rice", "Seasonal fruit", "Warm milk"],
      note: "Update this from the admin ERP so it reflects in the parent portal.",
    };

  return { announcements, events, lunchMenu };
}

export async function getTeacherPortalData(userId?: string) {
  if (!userId) {
    return null;
  }

  const teacher = await prisma.teacher.findUnique({
    where: { userId },
    include: {
      user: true,
      classes: {
        include: {
          class: {
            include: {
              students: {
                orderBy: { firstName: "asc" },
                take: 12,
              },
            },
          },
        },
      },
      homeworkUpdates: {
        orderBy: { publishedAt: "desc" },
        take: 5,
      },
      observationNotes: {
        orderBy: { observedAt: "desc" },
        take: 5,
        include: { student: true },
      },
    },
  });

  return teacher;
}

export async function getParentPortalData(userId?: string) {
  if (!userId) {
    return null;
  }

  const parent = await prisma.parent.findUnique({
    where: { userId },
    include: {
      user: true,
      parentStudents: {
        include: {
          student: {
            include: {
              currentClass: true,
              attendance: {
                orderBy: { date: "desc" },
                take: 30,
              },
              invoices: {
                orderBy: { dueDate: "desc" },
                take: 5,
                include: {
                  payments: true,
                },
              },
              receipts: {
                orderBy: { issuedAt: "desc" },
                take: 5,
              },
              observations: {
                orderBy: { observedAt: "desc" },
                take: 4,
              },
            },
          },
        },
      },
    },
  });

  return parent;
}
