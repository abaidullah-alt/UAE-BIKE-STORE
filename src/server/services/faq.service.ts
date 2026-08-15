import { prisma } from "@/lib/db/prisma";

export async function listFaqs(publishedOnly = false) {
  return prisma.faq.findMany({
    where: publishedOnly ? { isPublished: true } : undefined,
    orderBy: { sortOrder: "asc" },
  });
}

export async function createFaq(question: string, answer: string) {
  const count = await prisma.faq.count();
  return prisma.faq.create({ data: { question, answer, sortOrder: count } });
}

export async function deleteFaq(id: string) {
  await prisma.faq.delete({ where: { id } });
}

export async function toggleFaqPublished(id: string, isPublished: boolean) {
  await prisma.faq.update({ where: { id }, data: { isPublished } });
}
