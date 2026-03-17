import {
  NotificationChannel,
  NotificationStatus,
  NotificationType,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

type DispatchPayload = {
  title: string;
  message: string;
  type: NotificationType;
  metadata?: Prisma.JsonObject;
  recipientUserIds?: string[];
};

type ChannelDispatcher = {
  send: (payload: DispatchPayload) => Promise<void>;
};

const dashboardDispatcher: ChannelDispatcher = {
  async send(payload) {
    const recipientIds = payload.recipientUserIds?.length ? payload.recipientUserIds : [undefined];

    await prisma.notification.createMany({
      data: recipientIds.map((recipientUserId) => ({
        title: payload.title,
        message: payload.message,
        type: payload.type,
        channel: NotificationChannel.DASHBOARD,
        status: NotificationStatus.SENT,
        recipientUserId,
        metadata: payload.metadata,
      })),
    });
  },
};

const noopExternalDispatcher =
  (channel: NotificationChannel): ChannelDispatcher => ({
    async send(payload) {
      await prisma.notification.create({
        data: {
          title: payload.title,
          message: payload.message,
          type: payload.type,
          channel,
          status:
            channel === NotificationChannel.EMAIL
              ? NotificationStatus.QUEUED
              : NotificationStatus.RETRYING,
          metadata: payload.metadata,
        },
      });
    },
  });

export const notificationService = {
  async dispatch(payload: DispatchPayload) {
    await dashboardDispatcher.send(payload);
    await noopExternalDispatcher(NotificationChannel.EMAIL).send(payload);

    if (process.env.WHATSAPP_PROVIDER && process.env.WHATSAPP_PROVIDER !== "disabled") {
      await noopExternalDispatcher(NotificationChannel.WHATSAPP).send(payload);
    }

    if (process.env.SMS_PROVIDER && process.env.SMS_PROVIDER !== "disabled") {
      await noopExternalDispatcher(NotificationChannel.SMS).send(payload);
    }
  },
};
