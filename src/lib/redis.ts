import Redis from "ioredis";

let redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) {
    console.warn("REDIS_URL not set, cache will be disabled");
    return null;
  }

  if (!redis) {
    try {
      redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) {
            return null; // Stop retrying
          }
          return Math.min(times * 50, 2000);
        },
      });

      redis.on("error", (err) => {
        console.error("Redis connection error:", err);
        redis = null;
      });
    } catch (error) {
      console.error("Failed to connect to Redis:", error);
      return null;
    }
  }

  return redis;
}

export async function getCache<T>(key: string): Promise<T | null> {
  const client = getRedis();
  if (!client) return null;

  try {
    const data = await client.get(key);
    return data ? (JSON.parse(data) as T) : null;
  } catch (error) {
    console.error("Redis get error:", error);
    return null;
  }
}

export async function setCache<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
  const client = getRedis();
  if (!client) return false;

  try {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await client.setex(key, ttlSeconds, serialized);
    } else {
      await client.set(key, serialized);
    }
    return true;
  } catch (error) {
    console.error("Redis set error:", error);
    return false;
  }
}

export async function deleteCache(key: string): Promise<boolean> {
  const client = getRedis();
  if (!client) return false;

  try {
    await client.del(key);
    return true;
  } catch (error) {
    console.error("Redis delete error:", error);
    return false;
  }
}

