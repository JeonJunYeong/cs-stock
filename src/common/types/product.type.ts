export interface Product {
  brand: string;
  productNo?: string;
  productCode: string;
  barcode?: string;
  name: string;
  price?: number;
  smCd?: string;
  stokMngCd?: string;
  stokMngQty?: number;
  stockApplicationRate?: string;
  raw?: unknown;
}
