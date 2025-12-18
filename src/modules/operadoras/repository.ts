import { prisma } from "@/lib/db/prisma";
import type { Operadora, CreateOperadoraInput } from "@/types";

export class OperadoraRepository {
  async findAll(ativo?: boolean): Promise<Operadora[]> {
    const where = ativo !== undefined ? { ativo } : {};
    const operadoras = await prisma.operadora.findMany({
      where,
      orderBy: [
        { ordemRecomendacao: "asc" },
        { nome: "asc" },
      ],
    });
    return operadoras as Operadora[];
  }

  async findById(id: string): Promise<Operadora | null> {
    const operadora = await prisma.operadora.findUnique({
      where: { id },
    });
    return operadora as Operadora | null;
  }

  async findBySlug(slug: string): Promise<Operadora | null> {
    const operadora = await prisma.operadora.findUnique({
      where: { slug },
    });
    return operadora as Operadora | null;
  }

  async create(data: CreateOperadoraInput): Promise<Operadora> {
    const operadora = await prisma.operadora.create({
      data,
    });
    return operadora as Operadora;
  }

  async update(id: string, data: Partial<CreateOperadoraInput>): Promise<Operadora> {
    const operadora = await prisma.operadora.update({
      where: { id },
      data,
    });
    return operadora as Operadora;
  }

  async delete(id: string): Promise<void> {
    await prisma.operadora.delete({
      where: { id },
    });
  }
}


