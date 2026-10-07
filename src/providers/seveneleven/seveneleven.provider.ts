import { Injectable } from "@nestjs/common";
import {
  ConvenienceProvider,
  UpstreamApiError,
  NotImplementedProviderError,
} from "../../common/interfaces/convenience-provider.interface";
import { Product } from "../../common/types/product.type";
import { Store } from "../../common/types/store.type";
import { Inventory } from "../../common/types/inventory.type";
import { SevenElevenClient } from "./seveneleven.client";
import {
  mapSevenInventory,
  mapSevenProducts,
  mapSevenStockMeta,
  mapSevenStores,
} from "./seveneleven.mapper";
@Injectable()
export class SevenElevenProvider implements ConvenienceProvider {
  constructor(private client: SevenElevenClient) {}
  private async call<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (e) {
      throw new UpstreamApiError("SEVEN_ELEVEN", { cause: e });
    }
  }
  searchProducts(k: string): Promise<Product[]> {
    return this.call(async () =>
      mapSevenProducts(await this.client.products(k)),
    );
  }
  searchStores(k: string): Promise<Store[]> {
    return this.call(async () => mapSevenStores(await this.client.stores(k)));
  }
  async getInventory(productCode: string, storeCodes: string[]): Promise<Inventory[]> {
    return this.call(async () => {
      const meta = mapSevenStockMeta(await this.client.stockMeta(productCode));
      if (
        !meta.smCd ||
        !meta.stokMngCd ||
        meta.stokMngQty === undefined ||
        !meta.stockApplicationRate
      )
        throw new NotImplementedProviderError("SEVEN_ELEVEN", "inventory");
      const response = await this.client.stock({
        smCd: meta.smCd,
        stokMngCd: meta.stokMngCd,
        stokMngQty: meta.stokMngQty,
        stockApplicationRate: meta.stockApplicationRate,
        storeList: storeCodes,
      });
      return mapSevenInventory(response, productCode);
    });
  }
}
