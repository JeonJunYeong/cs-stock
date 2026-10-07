import { Product } from "../../common/types/product.type";
import { Store } from "../../common/types/store.type";
import { Inventory } from "../../common/types/inventory.type";

const asArray = (value: any): any[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const extractDocuments = (body: any): any[] => {
  if (Array.isArray(body)) return body;
  const direct =
    body?.items ??
    body?.data?.items ??
    body?.data?.list ??
    body?.data?.storeList ??
    body?.storeList;
  if (Array.isArray(direct)) return direct;
  return asArray(body?.data?.SearchQueryResult?.Collection).flatMap((c: any) =>
    asArray(c?.Documentset?.Document),
  );
};

const unwrapField = (document: any) => document?.field ?? document;

const requiredString = (value: any, field: string): string => {
  if (value === undefined || value === null || value === "")
    throw new Error(`INVALID_RESPONSE: missing ${field}`);
  return String(value);
};

export const mapSevenProducts = (body: any): Product[] => {
  return extractDocuments(body)
    .map((d: any) => d?.field ?? d)
    .filter((x: any) => x.itemCd || x.prdNo)
    .map((x: any) => ({
      brand: "SEVEN_ELEVEN",
      productNo: x.prdNo ? String(x.prdNo) : undefined,
      productCode: String(x.itemCd || x.prdNo),
      barcode: x.barcode,
      name: String(x.itemOnm ?? ""),
      price: Number(x.onlinePrice) || undefined,
      smCd: x.smCd ? String(x.smCd) : undefined,
      stokMngCd: x.stokMngCd ? String(x.stokMngCd) : undefined,
      stokMngQty: Number(x.stokMngQty) || undefined,
      stockApplicationRate: x.stockApplicationRate
        ? String(x.stockApplicationRate)
        : undefined,
      raw: x,
    }));
};
export const mapSevenStores = (body: any): Store[] => {
  return extractDocuments(body)
    .map((d: any) => d?.field ?? d)
    .filter(
      (x: any) => x.storeCode || x.storeCd || x.strCd || x.storCd || x.shopCd,
    )
    .map((x: any) => ({
      brand: "SEVEN_ELEVEN",
      storeCode: String(
        x.storeCode || x.storeCd || x.strCd || x.storCd || x.shopCd,
      ),
      name: String(
        x.storeName || x.storeNm || x.strNm || x.storNm || x.shopNm || "",
      ),
      address: x.address || x.addr || x.roadAddr,
      latitude: Number(x.latitude || x.storeLat || x.lat) || undefined,
      longitude: Number(x.longitude || x.storeLon || x.lng) || undefined,
      raw: x,
    }));
};

export const mapSevenStockMeta = (body: any): Product => {
  console.log('body:::',body);
  const item = extractDocuments(body).map(unwrapField).find(Boolean);
  console.log(item)
  if (!item) throw new Error("PRODUCT_NOT_FOUND");
  const stokMngQty = Number(requiredString(item.stokMngQty, "stokMngQty"));
  return {
    brand: "SEVEN_ELEVEN",
    productNo: requiredString(item.prdNo, "prdNo"),
    productCode: requiredString(item.itemCd, "itemCd"),
    name: requiredString(item.itemOnm, "itemOnm"),
    smCd: requiredString(item.smCd, "smCd"),
    stokMngCd: requiredString(item.stokMngCd, "stokMngCd"),
    stokMngQty,
    stockApplicationRate: requiredString(
      item.stockApplicationRate,
      "stockApplicationRate",
    ),
    raw: item,
  };
};

export const mapSevenInventory = (
  body: any,
  productCode: string,
): Inventory[] => {
  const stores = body?.storeList ?? body?.data?.storeList;
  if (!Array.isArray(stores)) throw new Error("INVALID_RESPONSE: storeList");
  return stores.map((store: any) => ({
    brand: "SEVEN_ELEVEN",
    productCode,
    storeCode: requiredString(
      store.storeCd ?? store.storeCode ?? store.strCd,
      "storeCd",
    ),
    quantity: Number(store.stock ?? store.quantity ?? 0),
    checkedAt: new Date(),
    raw: store,
  }));
};
