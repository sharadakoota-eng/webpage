import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type TxClient = Prisma.TransactionClient;

export function getIndiaFinancialYear(date = new Date()) {
  const year = date.getFullYear();
  const startsInCurrentYear = date.getMonth() >= 3;
  const startYear = startsInCurrentYear ? year : year - 1;
  const endYear = startYear + 1;

  return `${startYear}-${String(endYear).slice(-2)}`;
}

export async function createSequentialNumber(
  prefix: string,
  tx: TxClient | typeof prisma = prisma,
  date = new Date(),
) {
  const financialYear = getIndiaFinancialYear(date);
  const key = `${prefix}/${financialYear}`;

  await tx.numberSequence.upsert({
    where: { key },
    update: {},
    create: {
      key,
      prefix,
      financialYear,
      lastNumber: 0,
    },
  });

  const sequence = await tx.numberSequence.update({
    where: { key },
    data: {
      lastNumber: {
        increment: 1,
      },
    },
  });

  return `${prefix}/${financialYear}/${String(sequence.lastNumber).padStart(3, "0")}`;
}
