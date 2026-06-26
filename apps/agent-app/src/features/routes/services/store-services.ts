import StoresDao from "@/src/lib/dao/store-dao";

export function getStoresForProvince(provinceId: string) {
  return StoresDao.getStoresForProvince(provinceId);
}

export function getStoreById(id: string) {
  return StoresDao.getStoreById(id);
}
