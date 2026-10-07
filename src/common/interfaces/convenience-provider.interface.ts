import { Inventory } from "../types/inventory.type";
import { Product } from "../types/product.type";
import { Store } from "../types/store.type";
export interface ConvenienceProvider {
  searchProducts(keyword: string): Promise<Product[]>;
  searchStores(keyword: string, lat?: number, lng?: number): Promise<Store[]>;
  getInventory(productCode: string, storeCodes: string[]): Promise<Inventory[]>;
}
export class UpstreamApiError extends Error {
  readonly code = "UPSTREAM_API_ERROR";
  constructor(
    readonly brand: string,
    options?: { cause?: unknown },
  ) {
    super(`${brand} upstream request failed`);
    this.name = "UpstreamApiError";
    (this as Error & { cause?: unknown }).cause = options?.cause;
  }
}
export class NotImplementedProviderError extends Error {
  readonly code = "NOT_IMPLEMENTED";
  constructor(
    readonly brand: string,
    readonly capability: string,
  ) {
    super(
      `${brand} ${capability} API has not been verified for direct integration`,
    );
  }
}
