export interface Inventory {
  brand: string;
  productCode: string;
  storeCode: string;
  storeName?: string;
  quantity: number;
  checkedAt: Date;
  raw?: unknown;
}

export interface InventoryResult {
  productCode: string;
  stores: Inventory[];
}
