import type { MasterData } from "../master-data";
import { getDatabase } from "./database";

type MasterDataCacheRow = {
  payload: string;
  updated_at: string;
};

function getCacheKey(userId: number): string {
  return `master_data:${userId}`;
}

export async function saveMasterDataCache(
  userId: number,
  data: MasterData,
): Promise<void> {
  const db = await getDatabase();

  const cacheKey = getCacheKey(userId);
  const payload = JSON.stringify(data);
  const updatedAt = new Date().toISOString();

  await db.runAsync(
    `
      INSERT INTO master_data_cache (
        data_type,
        payload,
        updated_at
      )
      VALUES (?, ?, ?)
      ON CONFLICT(data_type)
      DO UPDATE SET
        payload = excluded.payload,
        updated_at = excluded.updated_at
    `,
    cacheKey,
    payload,
    updatedAt,
  );
}

export async function getMasterDataCache(
  userId: number,
): Promise<MasterData | null> {
  const db = await getDatabase();

  const cacheKey = getCacheKey(userId);

  const row = await db.getFirstAsync<MasterDataCacheRow>(
    `
      SELECT
        payload,
        updated_at
      FROM master_data_cache
      WHERE data_type = ?
      LIMIT 1
    `,
    cacheKey,
  );

  if (!row?.payload) {
    return null;
  }

  try {
    return JSON.parse(row.payload) as MasterData;
  } catch (error) {
    console.warn("Cache master data rusak dan tidak dapat dibaca:", error);

    return null;
  }
}

export async function getMasterDataCacheUpdatedAt(
  userId: number,
): Promise<string | null> {
  const db = await getDatabase();

  const cacheKey = getCacheKey(userId);

  const row = await db.getFirstAsync<MasterDataCacheRow>(
    `
      SELECT
        payload,
        updated_at
      FROM master_data_cache
      WHERE data_type = ?
      LIMIT 1
    `,
    cacheKey,
  );

  return row?.updated_at ?? null;
}

export async function clearMasterDataCache(userId: number): Promise<void> {
  const db = await getDatabase();

  const cacheKey = getCacheKey(userId);

  await db.runAsync(
    `
      DELETE FROM master_data_cache
      WHERE data_type = ?
    `,
    cacheKey,
  );
}
