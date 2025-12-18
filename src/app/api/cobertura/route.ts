import { NextRequest, NextResponse } from "next/server";
import { CoberturaService } from "@/modules/cobertura/service";
import { CEPSchema, CoordinateSchema } from "@/modules/shared/validations";
import { z } from "zod";

const coberturaService = new CoberturaService();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cep = searchParams.get("cep");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    // Check coverage by CEP
    if (cep) {
      try {
        const normalizedCEP = CEPSchema.parse(cep);
        const result = await coberturaService.checkCoverageByCEP(normalizedCEP);
        return NextResponse.json(result);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return NextResponse.json(
            { error: "CEP inválido", details: error.errors },
            { status: 400 }
          );
        }
        return NextResponse.json(
          { error: "Erro ao verificar cobertura", message: error instanceof Error ? error.message : "Erro desconhecido" },
          { status: 500 }
        );
      }
    }

    // Check coverage by coordinates
    if (lat && lng) {
      try {
        const coordinates = CoordinateSchema.parse({
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        });
        const result = await coberturaService.checkCoverageByCoordinates(
          coordinates.lat,
          coordinates.lng
        );
        return NextResponse.json(result);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return NextResponse.json(
            { error: "Coordenadas inválidas", details: error.errors },
            { status: 400 }
          );
        }
        return NextResponse.json(
          { error: "Erro ao verificar cobertura", message: error instanceof Error ? error.message : "Erro desconhecido" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "CEP ou coordenadas (lat, lng) são obrigatórios" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in coverage API:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}


