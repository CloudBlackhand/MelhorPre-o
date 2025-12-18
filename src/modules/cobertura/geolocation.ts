import axios from "axios";
import type { GeoLocation } from "@/types";
import { getCache, setCache } from "@/lib/redis";

const VIA_CEP_URL = process.env.VIA_CEP_API_URL || "https://viacep.com.br/ws";

export class GeolocationService {
  /**
   * Convert CEP to coordinates using ViaCEP API
   */
  static async cepToCoordinates(cep: string): Promise<GeoLocation | null> {
    // Clean CEP (remove dashes and spaces)
    const cleanCep = cep.replace(/\D/g, "");

    if (cleanCep.length !== 8) {
      throw new Error("CEP inválido. Deve conter 8 dígitos");
    }

    // Check cache first
    const cacheKey = `geocoding:cep:${cleanCep}`;
    const cached = await getCache<GeoLocation>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Get address from ViaCEP
      const response = await axios.get(`${VIA_CEP_URL}/${cleanCep}/json/`);

      if (response.data.erro) {
        throw new Error("CEP não encontrado");
      }

      const { logradouro, bairro, localidade, uf, cep: cepFormatted } = response.data;

      // Get coordinates from address using a geocoding service
      // For now, we'll use a simple approach with another API or return partial data
      // In production, you might want to use Google Geocoding API or similar
      const coordinates = await this.addressToCoordinates(
        `${logradouro}, ${bairro}, ${localidade}, ${uf}`
      );

      if (!coordinates) {
        // Fallback: return address without coordinates
        const location: GeoLocation = {
          lat: 0,
          lng: 0,
          cep: cepFormatted,
          logradouro,
          bairro,
          cidade: localidade,
          estado: uf,
        };
        return location;
      }

      const location: GeoLocation = {
        ...coordinates,
        cep: cepFormatted,
        logradouro,
        bairro,
        cidade: localidade,
        estado: uf,
      };

      // Cache for 24 hours
      await setCache(cacheKey, location, 86400);

      return location;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Erro ao buscar CEP: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Convert address to coordinates
   * This is a simplified version - in production, use a proper geocoding service
   */
  private static async addressToCoordinates(
    address: string
  ): Promise<{ lat: number; lng: number } | null> {
    // For now, return null - coordinates will need to be obtained from another service
    // You can integrate with:
    // - Google Geocoding API (requires API key)
    // - OpenStreetMap Nominatim (free but has rate limits)
    // - Other geocoding services

    // Example with Nominatim (uncomment if you want to use it):
    /*
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: address,
          format: 'json',
          limit: 1,
        },
        headers: {
          'User-Agent': 'MelhorPreco.net'
        }
      });

      if (response.data && response.data.length > 0) {
        return {
          lat: parseFloat(response.data[0].lat),
          lng: parseFloat(response.data[0].lon),
        };
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    */

    return null;
  }

  /**
   * Validate coordinates are within Brazil bounds
   */
  static validateCoordinates(lat: number, lng: number): boolean {
    // Brazil bounds: lat: -35 to 5, lng: -75 to -30
    return lat >= -35 && lat <= 5 && lng >= -75 && lng <= -30;
  }

  /**
   * Normalize CEP format
   */
  static normalizeCEP(cep: string): string {
    return cep.replace(/\D/g, "");
  }
}

