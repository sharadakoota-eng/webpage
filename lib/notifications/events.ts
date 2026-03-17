import { NotificationType, RoleType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { notificationService } from "@/lib/notifications/service";
import { notificationTemplates } from "@/lib/notifications/templates";

async function getFrontDeskRecipients() {
  const users = await prisma.user.findMany({
    where: {
      role: {
        type: {
          in: [RoleType.ADMIN, RoleType.FRONT_DESK],
        },
      },
    },
    select: { id: true },
  });

  return users.map((user) => user.id);
}

export async function triggerNewInquiryEvent(params: {
  inquiryId: string;
  parentName: string;
  phone: string;
  programName?: string;
}) {
  const template = notificationTemplates.newInquiry(params);
  await notificationService.dispatch({
    ...template,
    type: NotificationType.INQUIRY,
    recipientUserIds: await getFrontDeskRecipients(),
    metadata: { inquiryId: params.inquiryId },
  });
}

export async function triggerAdmissionEvent(params: {
  admissionId: string;
  parentName: string;
  childName: string;
  phone: string;
}) {
  const template = notificationTemplates.newAdmission(params);
  await notificationService.dispatch({
    ...template,
    type: NotificationType.ADMISSION,
    recipientUserIds: await getFrontDeskRecipients(),
    metadata: { admissionId: params.admissionId },
  });
}

export async function triggerVisitBookingEvent(params: {
  bookingId: string;
  parentName: string;
  phone: string;
  visitDate: string;
}) {
  const template = notificationTemplates.visitBooking(params);
  await notificationService.dispatch({
    ...template,
    type: NotificationType.VISIT,
    recipientUserIds: await getFrontDeskRecipients(),
    metadata: { bookingId: params.bookingId },
  });
}

export async function triggerImportantContactEvent(params: {
  submissionId: string;
  name: string;
  subject?: string;
}) {
  const template = notificationTemplates.importantContact(params);
  await notificationService.dispatch({
    ...template,
    type: NotificationType.CONTACT,
    recipientUserIds: await getFrontDeskRecipients(),
    metadata: { submissionId: params.submissionId },
  });
}
