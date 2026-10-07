import {
  Controller,
  Get,
  Param,
  Query,
  BadRequestException,
} from "@nestjs/common";
import { ProductService } from "./product.service";
@Controller("api/products")
export class ProductController {
  constructor(private service: ProductService) {}
  @Get(":brand") search(
    @Param("brand") brand: string,
    @Query("keyword") keyword: string,
  ) {
    if (!keyword?.trim()) throw new BadRequestException("keyword is required");
    return this.service.search(brand, keyword);
  }
}
