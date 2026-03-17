type TemplateInput = Record<string, string | undefined>;

export const notificationTemplates = {
  newInquiry: (input: TemplateInput) => ({
    title: "New Inquiry Received",
    message: `${input.parentName} submitted an inquiry${input.programName ? ` for ${input.programName}` : ""}. Contact: ${input.phone}.`,
  }),
  newAdmission: (input: TemplateInput) => ({
    title: "New Admission Form Submitted",
    message: `${input.parentName} submitted an admission form for ${input.childName}. Contact: ${input.phone}.`,
  }),
  visitBooking: (input: TemplateInput) => ({
    title: "New School Visit Booking",
    message: `${input.parentName} requested a visit on ${input.visitDate}. Contact: ${input.phone}.`,
  }),
  importantContact: (input: TemplateInput) => ({
    title: "Important Contact Submission",
    message: `${input.name} sent an important contact request${input.subject ? ` about ${input.subject}` : ""}.`,
  }),
  paymentSuccess: (input: TemplateInput) => ({
    title: "Payment Successful",
    message: `Payment received for invoice ${input.invoiceNumber ?? "pending reference"} from ${input.parentName ?? "a parent"}.`,
  }),
  paymentFailure: (input: TemplateInput) => ({
    title: "Payment Failed",
    message: `A payment attempt failed for invoice ${input.invoiceNumber ?? "pending reference"}.`,
  }),
  leaveRequest: (input: TemplateInput) => ({
    title: "Leave Request Submitted",
    message: `A leave request was submitted for ${input.childName} from ${input.startDate} to ${input.endDate}.`,
  }),
};
