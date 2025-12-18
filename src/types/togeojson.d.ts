// Type declaration for @mapbox/togeojson
declare module "@mapbox/togeojson" {
  import type { FeatureCollection } from "geojson";
  
  function kml(kml: any): FeatureCollection;
  function gpx(gpx: any): FeatureCollection;
  
  const toGeoJSON: {
    kml: typeof kml;
    gpx: typeof gpx;
  };
  
  export default toGeoJSON;
  export { kml, gpx };
}

