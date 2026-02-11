import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getRedis } from "@/lib/redis";

// Force dynamic rendering for health check
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  // Always return 200 for healthcheck - Railway needs this
  // The service is considered healthy if it can respond, even if DB/cache are down
  const health: {
    status: string;
    database: string;
    cache: string;
    timestamp: string;
  } = {
    status: "ok",
    database: "unknown",
    cache: "unknown",
    timestamp: new Date().toISOString(),
  };

  // Check database (non-blocking)
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 2000))
    ]);
    health.database = "connected";
  } catch (error) {
    health.database = "disconnected";
    health.status = "degraded";
  }

  // Check cache (non-blocking)
  try {
    const redis = getRedis();
    if (redis) {
      await Promise.race([
        redis.ping(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 1000))
      ]);
      health.cache = "connected";
    } else {
      health.cache = "not_configured";
    }
  } catch (error) {
    health.cache = "disconnected";
  }

  // Always return 200 - Railway healthcheck just needs the service to respond
  return NextResponse.json(health, { status: 200 });
}


