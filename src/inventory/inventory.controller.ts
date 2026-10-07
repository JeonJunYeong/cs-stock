import {
  Controller,
  Get,
  Param,
  Query,
  BadRequestException,
} from "@nestjs/common";
import { InventoryService } from "./inventory.service";
@Controller("api/inventory")
export class InventoryController {
  constructor(private service: InventoryService) {}
  @Get(":brand") lookup(
    @Param("brand") brand: string,
    @Query("productCode") product: string,
    @Query("storeCodes") stores: string,
  ) {
    if (!product || !stores)
      throw new BadRequestException("productCode and storeCodes are required");
    return this.service.lookup(
      brand,
      product,
      stores
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
    );
  }
}
