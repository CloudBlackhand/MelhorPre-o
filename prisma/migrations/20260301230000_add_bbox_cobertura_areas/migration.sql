-- AlterTable: add bbox columns for pre-filtering point-in-polygon queries
ALTER TABLE "cobertura_areas" ADD COLUMN IF NOT EXISTS "bbox_min_lat" DOUBLE PRECISION;
ALTER TABLE "cobertura_areas" ADD COLUMN IF NOT EXISTS "bbox_max_lat" DOUBLE PRECISION;
ALTER TABLE "cobertura_areas" ADD COLUMN IF NOT EXISTS "bbox_min_lng" DOUBLE PRECISION;
ALTER TABLE "cobertura_areas" ADD COLUMN IF NOT EXISTS "bbox_max_lng" DOUBLE PRECISION;

-- CreateIndex (IF NOT EXISTS supported in PostgreSQL 9.5+)
CREATE INDEX IF NOT EXISTS "cobertura_areas_bbox_idx" ON "cobertura_areas"("bbox_min_lat", "bbox_max_lat", "bbox_min_lng", "bbox_max_lng");
