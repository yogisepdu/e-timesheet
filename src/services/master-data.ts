import { apiRequest, getAuthUser } from "./api";
import {
  getMasterDataCache,
  saveMasterDataCache,
} from "./offline/master-data-cache";

export type ProductionUnit = "Meter" | "m³" | "Ha";

export type ContractorMaster = {
  id: number;
  code: string;
  name: string;
  type: "internal" | "external" | string;
};

export type OperatorMaster = {
  id: number;
  contractor_id: number | null;
  code: string;
  name: string;
  display_name: string;
  contractor: ContractorMaster | null;
};

export type EquipmentUnitMaster = {
  id: number;
  contractor_id: number | null;
  code: string;
  equipment_type: string;
  brand: string | null;
  model: string | null;
  display_name: string;
  contractor: ContractorMaster | null;
};

export type ActivityMaster = {
  id: number;
  code: string;
  name: string;
  default_production_unit: ProductionUnit | null;
};

export type ProductionUnitOption = {
  value: ProductionUnit;
  label: string;
};

export type MasterData = {
  contractors: ContractorMaster[];
  operators: OperatorMaster[];
  equipment_units: EquipmentUnitMaster[];
  activities: ActivityMaster[];
  production_units: ProductionUnitOption[];
};

type MasterDataResponse = {
  data: MasterData;
};

export async function getMasterData(): Promise<MasterData> {
  const user = await getAuthUser();

  if (!user) {
    throw new Error("User belum login. Tidak dapat mengambil master data.");
  }

  try {
    const response = await apiRequest<MasterDataResponse>("/master-data");

    const masterData = response.data;

    await saveMasterDataCache(user.id, masterData);

    return masterData;
  } catch (error) {
    console.warn(
      "Gagal mengambil master data dari server. Mencoba cache lokal...",
      error,
    );

    const cachedData = await getMasterDataCache(user.id);

    if (cachedData) {
      return cachedData;
    }

    throw error;
  }
}
