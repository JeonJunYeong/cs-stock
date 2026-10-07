import { Injectable } from "@nestjs/common";
import {
  ConvenienceProvider,
  UpstreamApiError,
  NotImplementedProviderError,
} from "../../common/interfaces/convenience-provider.interface";
import { Product } from "../../common/types/product.type";
import { Store } from "../../common/types/store.type";
import { Inventory } from "../../common/types/inventory.type";
import { CuClient } from "./cu.client";
import { mapCuProducts, mapCuStores } from "./cu.mapper";
@Injectable()
export class CuProvider implements ConvenienceProvider {
  constructor(private client: CuClient) {}
  private async call<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (e) {
      throw new UpstreamApiError("CU", { cause: e });
    }
  }
  searchProducts(k: string): Promise<Product[]> {
    return this.call(async () => mapCuProducts(await this.client.products(k)));
  }
  searchStores(k: string): Promise<Store[]> {
    return this.call(async () => mapCuStores(await this.client.stores(k)));
  }
  async getInventory(_p: string, _s: string[]): Promise<Inventory[]> {
    throw new NotImplementedProviderError("CU", "inventory");
  }
}
