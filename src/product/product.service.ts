import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BrandEntity, ProductEntity } from "../database/entities";
import { ProviderRegistry } from "../providers/provider.registry";
@Injectable()
export class ProductService {
  constructor(
    private registry: ProviderRegistry,
    @InjectRepository(ProductEntity) private repo: Repository<ProductEntity>,
    @InjectRepository(BrandEntity) private brands: Repository<BrandEntity>,
  ) {}
  async search(brand: string, keyword: string) {
    const provider = this.registry.get(brand);
    const brandEntity = await this.brands.findOneBy({
      code: brand.toUpperCase(),
    });
    if (!brandEntity) throw new NotFoundException("Brand not found");
    const items = await provider.searchProducts(keyword);
    for (const p of items)
      await this.repo.upsert(
        {
          brandId: brandEntity.id,
          productNo: p.productNo,
          productCode: p.productCode,
          barcode: p.barcode,
          name: p.name,
          price: p.price,
          smCd: p.smCd,
          stokMngCd: p.stokMngCd,
          stokMngQty: p.stokMngQty,
          stockApplicationRate: p.stockApplicationRate,
          metadata: p.raw as any,
        },
        ["brandId", "productCode"],
      );
    return items;
  }
}
