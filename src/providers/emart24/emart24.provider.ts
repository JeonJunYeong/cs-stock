import { Injectable } from "@nestjs/common";
import {
  ConvenienceProvider,
  UpstreamApiError,
} from "../../common/interfaces/convenience-provider.interface";
import { Product } from "../../common/types/product.type";
import { Store } from "../../common/types/store.type";
import { Inventory } from "../../common/types/inventory.type";
import { Emart24Client } from "./emart24.client";
import {
  mapEmartProducts,
  mapEmartStores,
  mapEmartInventory,
} from "./emart24.mapper";

@Injectable()
export class Emart24Provider implements ConvenienceProvider {
  constructor(private client: Emart24Client) {}

  private async call<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (e) {
      throw new UpstreamApiError("EMART24", { cause: e });
    }
  }

  searchProducts(k: string): Promise<Product[]> {
    return this.call(async () =>
      mapEmartProducts(await this.client.products(k)),
    );
  }

  searchStores(k: string): Promise<Store[]> {
    return this.call(async () => mapEmartStores(await this.client.stores(k)));
  }

  getInventory(p: string, s: string[]): Promise<Inventory[]> {
    return this.call(async () =>
      mapEmartInventory(await this.client.inventory(p, s), p),
    );
  }
}
