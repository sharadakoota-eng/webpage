import { InvoiceStatus, PaymentStatus, ProgramCategory, Prisma, type Program } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type TxClient = Prisma.TransactionClient;

function randomSuffix(length = 5) {
  return Math.floor(Math.random() * 10 ** length)
    .toString()
    .padStart(length, "0");
}

export function createInvoiceNumber() {
  return `INV-${new Date().getFullYear()}-${randomSuffix()}`;
}

export function createReceiptNumber() {
  return `RCT-${new Date().getFullYear()}-${randomSuffix()}`;
}

export function isRecurringProgramFeeManaged(program: Pick<Program, "category"> | null | undefined) {
  return !!program && program.category !== ProgramCategory.CAMP;
}

export async function ensureProgramFeeReady(programId: string, tx: TxClient | typeof prisma = prisma) {
  const program = await tx.program.findUnique({
    where: { id: programId },
    include: {
      feeStructures: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!program) {
    throw new Error("Selected program was not found.");
  }

  if (!isRecurringProgramFeeManaged(program)) {
    return { program, feeStructures: [] };
  }

  const feeStructures = program.feeStructures.filter((fee) => Number(fee.amount) > 0);
  if (feeStructures.length === 0) {
    throw new Error("Please set price for this program before proceeding.");
  }

  return { program, feeStructures };
}

export async function createProgramInvoiceForStudent(args: {
  tx: TxClient;
  studentId: string;
  programId: string;
  dueDate?: Date;
  createdBy?: string;
}) {
  const { tx, studentId, programId, dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), createdBy = "system" } = args;
  const { program, feeStructures } = await ensureProgramFeeReady(programId, tx);

  if (!isRecurringProgramFeeManaged(program)) {
    return null;
  }

  const existingInvoices = await tx.invoice.findMany({
    where: {
      studentId,
      status: {
        in: [InvoiceStatus.DRAFT, InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE],
      },
    },
    select: {
      id: true,
      lineItems: true,
    },
  });

  const existingInvoice = existingInvoices.find((invoice) => {
    const lineItems = invoice.lineItems as Record<string, unknown> | null;
    return lineItems?.programId === programId && lineItems?.invoiceType === "PROGRAM_ENROLLMENT";
  });

  if (existingInvoice) {
    return await tx.invoice.findUniqueOrThrow({
      where: { id: existingInvoice.id },
    });
  }

  const amount = feeStructures.reduce((sum, fee) => sum + Number(fee.amount), 0);
  if (amount <= 0) {
    throw new Error("Please set price for this program before proceeding.");
  }

  return await tx.invoice.create({
    data: {
      invoiceNumber: createInvoiceNumber(),
      studentId,
      amount,
      dueDate,
      status: InvoiceStatus.ISSUED,
      lineItems: {
        invoiceType: "PROGRAM_ENROLLMENT",
        createdBy,
        programId: program.id,
        programName: program.name,
        feeStructureIds: feeStructures.map((fee) => fee.id),
        items: feeStructures.map((fee) => ({
          feeStructureId: fee.id,
          title: fee.title,
          frequency: fee.frequency,
          amount: Number(fee.amount),
          description: fee.description ?? undefined,
        })),
      },
    },
  });
}

export async function createManualInvoice(args: {
  tx: TxClient;
  studentId: string;
  title: string;
  amount: number;
  dueDate?: Date;
  programId?: string | null;
  createdBy?: string;
  metadata?: Record<string, unknown>;
}) {
  const { tx, studentId, title, amount, dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), programId, createdBy = "admin_manual", metadata = {} } = args;

  return await tx.invoice.create({
    data: {
      invoiceNumber: createInvoiceNumber(),
      studentId,
      amount,
      dueDate,
      status: InvoiceStatus.ISSUED,
      lineItems: {
        invoiceType: "MANUAL",
        title,
        programId: programId ?? undefined,
        createdBy,
        items: [
          {
            title,
            amount,
          },
        ],
        ...metadata,
      },
    },
  });
}

export async function recordCashPayment(args: {
  tx: TxClient;
  invoiceId: string;
  amount: number;
  reference?: string;
}) {
  const { tx, invoiceId, amount, reference } = args;

  const payment = await tx.payment.create({
    data: {
      invoiceId,
      amount,
      method: "CASH",
      status: PaymentStatus.SUCCESS,
      paidAt: new Date(),
      gatewayPayload: {
        cashApproved: true,
        reference: reference ?? null,
      },
    },
  });

  const invoice = await tx.invoice.findUniqueOrThrow({
    where: { id: invoiceId },
    include: { payments: true, receipt: true },
  });

  const successfulAmount = invoice.payments
    .filter((entry) => entry.status === PaymentStatus.SUCCESS)
    .reduce((sum, entry) => sum + Number(entry.amount), 0);
  const totalPaid = successfulAmount + amount;
  const invoiceAmount = Number(invoice.amount);
  const nextInvoiceStatus = totalPaid >= invoiceAmount ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID;

  await tx.invoice.update({
    where: { id: invoiceId },
    data: {
      status: nextInvoiceStatus,
    },
  });

  if (!invoice.receipt && nextInvoiceStatus === InvoiceStatus.PAID) {
    await tx.receipt.create({
      data: {
        receiptNumber: createReceiptNumber(),
        studentId: invoice.studentId,
        invoiceId,
        paymentId: payment.id,
        amount: payment.amount,
        issuedAt: new Date(),
      },
    });
  }

  return payment;
}
