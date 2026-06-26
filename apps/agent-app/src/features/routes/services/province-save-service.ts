import ProvincesDao from "@/src/lib/dao/province-dao";
import { ProvinceRow } from "../types/db-rows";

export function getProvinces(routeId: string): ProvinceRow[] {
  return ProvincesDao.getProvincesForRoute(routeId);
}
