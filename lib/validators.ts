import { z } from "zod";

export const inquirySchema = z.object({
  parentName: z.string().min(2),
  childName: z.string().optional(),
  childAge: z.string().optional(),
  phone: z.string().min(10),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().max(1000).optional(),
  programSlug: z.string().optional(),
});

export const admissionSchema = z.object({
  parentName: z.string().min(2),
  childName: z.string().min(2),
  childDob: z.string().min(1),
  phone: z.string().min(10),
  email: z.string().email().optional().or(z.literal("")),
  notes: z.string().max(2000).optional(),
  programSlug: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(10).optional().or(z.literal("")),
  subject: z.string().min(2).optional().or(z.literal("")),
  message: z.string().min(10).max(2000),
});

export const visitBookingSchema = z.object({
  parentName: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email().optional().or(z.literal("")),
  childName: z.string().optional(),
  visitDate: z.string().min(1),
  notes: z.string().max(1000).optional(),
});
