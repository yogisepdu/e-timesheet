import { apiRequest } from "./api";

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

export async function getMasterData() {
  const response = await apiRequest<MasterDataResponse>("/master-data");

  return response.data;
}
