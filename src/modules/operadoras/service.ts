import { OperadoraRepository } from "./repository";
import type { Operadora, CreateOperadoraInput } from "@/types";
import { getCache, setCache, deleteCache } from "@/lib/redis";

export class OperadoraService {
  private repository: OperadoraRepository;

  constructor() {
    this.repository = new OperadoraRepository();
  }

  async getAll(ativo?: boolean): Promise<Operadora[]> {
    const cacheKey = ativo !== undefined ? `operadoras:${ativo ? "ativas" : "todas"}` : "operadoras:todas";
    
    // Try cache first
    const cached = await getCache<Operadora[]>(cacheKey);
    if (cached) return cached;

    // Fetch from database
    const operadoras = await this.repository.findAll(ativo);

    // Cache for 1 hour
    await setCache(cacheKey, operadoras, 3600);

    return operadoras;
  }

  async getById(id: string): Promise<Operadora | null> {
    return this.repository.findById(id);
  }

  async getBySlug(slug: string): Promise<Operadora | null> {
    return this.repository.findBySlug(slug);
  }

  async create(data: CreateOperadoraInput): Promise<Operadora> {
    const operadora = await this.repository.create(data);
    
    // Invalidate cache
    await deleteCache("operadoras:ativas");
    await deleteCache("operadoras:todas");

    return operadora;
  }

  async update(id: string, data: Partial<CreateOperadoraInput>): Promise<Operadora> {
    const operadora = await this.repository.update(id, data);
    
    // Invalidate cache
    await deleteCache("operadoras:ativas");
    await deleteCache("operadoras:todas");
    await deleteCache(`operadoras:${id}`);

    return operadora;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
    
    // Invalidate cache
    await deleteCache("operadoras:ativas");
    await deleteCache("operadoras:todas");
  }
}

