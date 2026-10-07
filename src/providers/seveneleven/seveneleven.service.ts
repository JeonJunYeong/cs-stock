import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  BrandEntity,
  InventoryEntity,
  MonitorTargetEntity,
  ProductEntity,
  StoreEntity,
} from "../../database/entities";
import { Product } from "../../common/types/product.type";
import { Store } from "../../common/types/store.type";
import { SevenElevenClient } from "./seveneleven.client";
import {
  mapSevenInventory,
  mapSevenProducts,
  mapSevenStockMeta,
  mapSevenStores,
} from "./seveneleven.mapper";

@Injectable()
export class SevenElevenService {
  constructor(
    private readonly client: SevenElevenClient,
    @InjectRepository(BrandEntity)
    private readonly brands: Repository<BrandEntity>,
    @InjectRepository(ProductEntity)
    private readonly products: Repository<ProductEntity>,
    @InjectRepository(StoreEntity)
    private readonly stores: Repository<StoreEntity>,
    @InjectRepository(InventoryEntity)
    private readonly inventories: Repository<InventoryEntity>,
    @InjectRepository(MonitorTargetEntity)
    private readonly monitorTargets: Repository<MonitorTargetEntity>,
  ) {}

  private async brand() {
    const brand = await this.brands.findOneBy({ code: "SEVEN_ELEVEN" });
    if (!brand) throw new NotFoundException("SEVEN_ELEVEN brand not found");
    return brand;
  }

  private async saveProduct(product: Product) {
    const brand = await this.brand();
    await this.products.upsert(
      {
        brandId: brand.id,
        productNo: product.productNo,
        productCode: product.productCode,
        barcode: product.barcode,
        name: product.name,
        price: product.price,
        smCd: product.smCd,
        stokMngCd: product.stokMngCd,
        stokMngQty: product.stokMngQty,
        stockApplicationRate: product.stockApplicationRate,
        metadata: product.raw as any,
      },
      ["brandId", "productCode"],
    );
    return this.products.findOneByOrFail({
      brandId: brand.id,
      productCode: product.productCode,
    });
  }

  private async saveStore(store: Store) {
    const brand = await this.brand();
    await this.stores.upsert(
      {
        brandId: brand.id,
        storeCode: store.storeCode,
        name: store.name,
        address: store.address,
        telephone: store.telephone,
        latitude: store.latitude,
        longitude: store.longitude,
        metadata: store.raw as any,
      },
      ["brandId", "storeCode"],
    );
    return this.stores.findOneByOrFail({
      brandId: brand.id,
      storeCode: store.storeCode,
    });
  }

  async searchProducts(query: string) {
    const items = mapSevenProducts(await this.client.products(query));
    await Promise.all(items.map((item) => this.saveProduct(item)));
    return { items };
  }

  async fetchStockMeta(productCode: string) {
    const item = mapSevenStockMeta(await this.client.stockMeta(productCode));
    await this.saveProduct(item);
    return item;
  }

  async upsertProduct(body: any) {
    for (const field of [
      "productCode",
      "productNo",
      "name",
      "smCd",
      "stokMngCd",
      "stokMngQty",
      "stockApplicationRate",
    ])
      if (body?.[field] === undefined || body?.[field] === null)
        throw new BadRequestException(`${field} is required`);
    return this.saveProduct({
      brand: "SEVEN_ELEVEN",
      productCode: String(body.productCode),
      productNo: String(body.productNo),
      name: String(body.name),
      price: body.price === undefined ? undefined : Number(body.price),
      smCd: String(body.smCd),
      stokMngCd: String(body.stokMngCd),
      stokMngQty: Number(body.stokMngQty),
      stockApplicationRate: String(body.stockApplicationRate),
      raw: body.metadata ?? body,
    });
  }

  async searchStores(keyword: string) {
    const items = mapSevenStores(await this.client.stores(keyword));
    await Promise.all(items.map((item) => this.saveStore(item)));
    return { items };
  }

  async upsertStore(body: any) {
    for (const field of ["storeCode", "name"])
      if (!body?.[field]) throw new BadRequestException(`${field} is required`);
    return this.saveStore({
      brand: "SEVEN_ELEVEN",
      storeCode: String(body.storeCode),
      name: String(body.name),
      address: body.address,
      telephone: body.telephone,
      latitude: body.latitude === undefined ? undefined : Number(body.latitude),
      longitude:
        body.longitude === undefined ? undefined : Number(body.longitude),
      raw: body.metadata ?? body,
    });
  }

  async lookupInventory(productCode: string, storeCodes: string[]) {
    if (!storeCodes.length) throw new BadRequestException("storeCodes is required");
    const brand = await this.brand();
    const product = await this.products.findOneBy({ brandId: brand.id, productCode });
    if (!product) throw new NotFoundException("PRODUCT_NOT_FOUND");
    if (
      !product.smCd ||
      !product.stokMngCd ||
      product.stokMngQty === undefined ||
      !product.stockApplicationRate
    )
      throw new BadRequestException("Product stock metadata is missing");
    const response = await this.client.stock({
      smCd: product.smCd,
      stokMngCd: product.stokMngCd,
      stokMngQty: product.stokMngQty,
      stockApplicationRate: product.stockApplicationRate,
      storeList: storeCodes,
    });
    const rows = mapSevenInventory(response, productCode);
    for (const row of rows) {
      const store = await this.stores.findOneBy({
        brandId: brand.id,
        storeCode: row.storeCode,
      });
      if (!store) continue;
      await this.inventories.upsert(
        {
          brandId: brand.id,
          productId: product.id,
          storeId: store.id,
          quantity: row.quantity,
          checkedAt: row.checkedAt,
          metadata: row.raw as any,
        },
        ["brandId", "productId", "storeId"],
      );
    }
    return { productCode, stores: rows };
  }

  async listMonitorTargets() {
    return this.monitorTargets.find({
      relations: { product: true, store: true },
      order: { createdAt: "DESC" },
    });
  }

  async createMonitorTarget(body: any) {
    if (!body?.productCode || !body?.storeCode)
      throw new BadRequestException("productCode and storeCode are required");
    const brand = await this.brand();
    const product = await this.products.findOneBy({
      brandId: brand.id,
      productCode: String(body.productCode),
    });
    if (!product) throw new NotFoundException("PRODUCT_NOT_FOUND");
    const store = await this.stores.findOneBy({
      brandId: brand.id,
      storeCode: String(body.storeCode),
    });
    if (!store) throw new NotFoundException("STORE_NOT_FOUND");
    await this.monitorTargets.upsert(
      {
        productId: product.id,
        storeId: store.id,
        brandCode: "SEVEN_ELEVEN",
        productCode: product.productCode,
        storeCode: store.storeCode,
        enabled: true,
      },
      ["productId", "storeId"],
    );
    return this.monitorTargets.findOneOrFail({
      where: { productId: product.id, storeId: store.id },
      relations: { product: true, store: true },
    });
  }

  async updateMonitorTarget(id: string, body: any) {
    const target = await this.monitorTargets.findOneBy({ id });
    if (!target) throw new NotFoundException("MONITOR_TARGET_NOT_FOUND");
    target.enabled = Boolean(body.enabled);
    return this.monitorTargets.save(target);
  }

  async deleteMonitorTarget(id: string) {
    const target = await this.monitorTargets.findOneBy({ id });
    if (!target) throw new NotFoundException("MONITOR_TARGET_NOT_FOUND");
    await this.monitorTargets.delete(id);
    return { id, deleted: true };
  }
}
