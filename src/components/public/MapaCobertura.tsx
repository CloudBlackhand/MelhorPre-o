"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with Leaflet
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Polygon = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polygon),
  { ssr: false }
);

const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

import "leaflet/dist/leaflet.css";

interface MapaCoberturaProps {
  areas?: Array<{
    id: string;
    nomeArea: string;
    geometria: any; // GeoJSON
    operadora?: {
      nome: string;
    };
  }>;
  center?: [number, number];
  zoom?: number;
}

export function MapaCobertura({ areas = [], center = [-23.5505, -46.6333], zoom = 10 }: MapaCoberturaProps) {
  const getPolygonCoordinates = (geometry: any): [number, number][] => {
    if (!geometry || !geometry.coordinates) return [];
    
    if (geometry.type === "Polygon") {
      return geometry.coordinates[0].map((coord: number[]) => [coord[1], coord[0]]);
    }
    
    if (geometry.type === "MultiPolygon") {
      return geometry.coordinates[0][0].map((coord: number[]) => [coord[1], coord[0]]);
    }
    
    return [];
  };

  if (typeof window === "undefined") {
    return <div className="w-full h-[400px] bg-gray-200 rounded-lg" />;
  }

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {areas.map((area) => {
          if (!area.geometria || !area.geometria.features) return null;
          
          return area.geometria.features.map((feature: any, index: number) => {
            const coordinates = getPolygonCoordinates(feature.geometry);
            if (coordinates.length === 0) return null;
            
            return (
              <Polygon
                key={`${area.id}-${index}`}
                positions={coordinates}
                pathOptions={{
                  color: "#3b82f6",
                  fillColor: "#3b82f6",
                  fillOpacity: 0.2,
                }}
              >
                <Popup>
                  <div>
                    <strong>{area.nomeArea}</strong>
                    {area.operadora && <p>{area.operadora.nome}</p>}
                  </div>
                </Popup>
              </Polygon>
            );
          });
        })}
      </MapContainer>
    </div>
  );
}
