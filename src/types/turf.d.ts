// Type declaration for @turf/turf to fix module resolution issues
declare module "@turf/turf" {
  export function point(coordinates: [number, number], properties?: Record<string, any>): any;
  export function polygon(coordinates: number[][][], properties?: Record<string, any>): any;
  export function multiPolygon(coordinates: number[][][][], properties?: Record<string, any>): any;
  export function booleanPointInPolygon(point: any, polygon: any): boolean;
  export function bbox(feature: any): [number, number, number, number];
  
  const turf: {
    point: typeof point;
    polygon: typeof polygon;
    multiPolygon: typeof multiPolygon;
    booleanPointInPolygon: typeof booleanPointInPolygon;
    bbox: typeof bbox;
    [key: string]: any;
  };
  
  export default turf;
  export = turf;
}

