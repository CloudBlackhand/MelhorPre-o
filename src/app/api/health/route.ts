import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getRedis } from "@/lib/redis";

export async function GET() {
  try {
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

    // Check database
    try {
      await prisma.$queryRaw`SELECT 1`;
      health.database = "connected";
    } catch (error) {
      health.database = "disconnected";
      health.status = "degraded";
    }

    // Check cache
    const redis = getRedis();
    if (redis) {
      try {
        await redis.ping();
        health.cache = "connected";
      } catch (error) {
        health.cache = "disconnected";
      }
    } else {
      health.cache = "not_configured";
    }

    const statusCode = health.status === "ok" ? 200 : 503;
    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

