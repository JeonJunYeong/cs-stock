import {
  Controller,
  Get,
  Param,
  Query,
  BadRequestException,
} from "@nestjs/common";
import { StoreService } from "./store.service";
@Controller("api/stores")
export class StoreController {
  constructor(private service: StoreService) {}
  @Get(":brand") search(
    @Param("brand") brand: string,
    @Query("keyword") keyword: string,
    @Query("lat") lat?: string,
    @Query("lng") lng?: string,
  ) {
    if (!keyword?.trim()) throw new BadRequestException("keyword is required");
    return this.service.search(
      brand,
      keyword,
      lat ? Number(lat) : undefined,
      lng ? Number(lng) : undefined,
    );
  }
}
