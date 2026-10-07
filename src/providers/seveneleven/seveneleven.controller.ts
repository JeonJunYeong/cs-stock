import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { SevenElevenService } from "./seveneleven.service";

@Controller("api/seveneleven")
export class SevenElevenController {
  constructor(private readonly service: SevenElevenService) {}

  @Get("products")
  searchProducts(@Query("query") query: string) {
    if (!query?.trim()) throw new BadRequestException("query is required");
    return this.service.searchProducts(query);
  }

  @Post("products")
  upsertProduct(@Body() body: any) {
    return this.service.upsertProduct(body);
  }

  @Get("products/:productCode/stock-meta")
  stockMeta(@Param("productCode") productCode: string) {
    console.log(productCode)
    return this.service.fetchStockMeta(productCode);
  }

  @Get("stores")
  searchStores(@Query("keyword") keyword: string) {
    if (!keyword?.trim()) throw new BadRequestException("keyword is required");
    return this.service.searchStores(keyword);
  }

  @Post("stores")
  upsertStore(@Body() body: any) {
    return this.service.upsertStore(body);
  }

  @Get("inventory")
  inventory(
    @Query("productCode") productCode: string,
    @Query("storeCodes") storeCodes: string,
  ) {
    if (!productCode || !storeCodes)
      throw new BadRequestException("productCode and storeCodes are required");
    return this.service.lookupInventory(
      productCode,
      storeCodes
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    );
  }

  @Get("monitor")
  listMonitorTargets() {
    return this.service.listMonitorTargets();
  }

  @Post("monitor")
  createMonitorTarget(@Body() body: any) {
    return this.service.createMonitorTarget(body);
  }

  @Patch("monitor/:id")
  updateMonitorTarget(@Param("id") id: string, @Body() body: any) {
    return this.service.updateMonitorTarget(id, body);
  }

  @Delete("monitor/:id")
  deleteMonitorTarget(@Param("id") id: string) {
    return this.service.deleteMonitorTarget(id);
  }
}
