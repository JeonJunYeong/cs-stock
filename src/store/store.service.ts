import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BrandEntity, StoreEntity } from "../database/entities";
import { ProviderRegistry } from "../providers/provider.registry";
@Injectable()
export class StoreService {
  constructor(
    private registry: ProviderRegistry,
    @InjectRepository(StoreEntity) private repo: Repository<StoreEntity>,
    @InjectRepository(BrandEntity) private brands: Repository<BrandEntity>,
  ) {}
  async search(brand: string, keyword: string, lat?: number, lng?: number) {
    const provider = this.registry.get(brand);
    const brandEntity = await this.brands.findOneBy({
      code: brand.toUpperCase(),
    });
    if (!brandEntity) throw new NotFoundException("Brand not found");
    const items = await provider.searchStores(keyword, lat, lng);
    for (const s of items)
      await this.repo.upsert(
        {
          brandId: brandEntity.id,
          storeCode: s.storeCode,
          name: s.name,
          address: s.address,
          telephone: s.telephone,
          latitude: s.latitude,
          longitude: s.longitude,
          metadata: s.raw as any,
        },
        ["brandId", "storeCode"],
      );
    return items;
  }
}
