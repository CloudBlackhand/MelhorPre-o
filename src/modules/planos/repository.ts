import { prisma } from "@/lib/db/prisma";
import type { Plano, CreatePlanoInput } from "@/types";

export class PlanoRepository {
  async findAll(operadoraId?: string, ativo?: boolean): Promise<Plano[]> {
    const where: any = {};
    if (operadoraId) where.operadoraId = operadoraId;
    if (ativo !== undefined) where.ativo = ativo;

    const planos = await prisma.plano.findMany({
      where,
      include: {
        operadora: true,
      },
      orderBy: [
        { preco: "asc" },
        { velocidadeDownload: "desc" },
      ],
    });

    return planos.map((p) => ({
      ...p,
      preco: Number(p.preco),
      beneficios: p.beneficios as string[] | null,
    })) as Plano[];
  }

  async findById(id: string): Promise<Plano | null> {
    const plano = await prisma.plano.findUnique({
      where: { id },
      include: {
        operadora: true,
      },
    });

    if (!plano) return null;

    return {
      ...plano,
      preco: Number(plano.preco),
      beneficios: plano.beneficios as string[] | null,
    } as Plano;
  }

  async findByOperadoraId(operadoraId: string, ativo?: boolean): Promise<Plano[]> {
    return this.findAll(operadoraId, ativo);
  }

  async create(data: CreatePlanoInput): Promise<Plano> {
    const plano = await prisma.plano.create({
      data: {
        ...data,
        preco: data.preco,
        beneficios: data.beneficios || null,
      },
      include: {
        operadora: true,
      },
    });

    return {
      ...plano,
      preco: Number(plano.preco),
      beneficios: plano.beneficios as string[] | null,
    } as Plano;
  }

  async update(id: string, data: Partial<CreatePlanoInput>): Promise<Plano> {
    const plano = await prisma.plano.update({
      where: { id },
      data: {
        ...data,
        preco: data.preco !== undefined ? data.preco : undefined,
        beneficios: data.beneficios !== undefined ? data.beneficios : undefined,
      },
      include: {
        operadora: true,
      },
    });

    return {
      ...plano,
      preco: Number(plano.preco),
      beneficios: plano.beneficios as string[] | null,
    } as Plano;
  }

  async delete(id: string): Promise<void> {
    await prisma.plano.delete({
      where: { id },
    });
  }
}

