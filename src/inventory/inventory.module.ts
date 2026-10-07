import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  BrandEntity,
  InventoryEntity,
  ProductEntity,
  StoreEntity,
} from "../database/entities";
import { ProvidersModule } from "../providers/providers.module";
import { InventoryService } from "./inventory.service";
import { InventoryController } from "./inventory.controller";
@Module({
  imports: [
    TypeOrmModule.forFeature([
      InventoryEntity,
      BrandEntity,
      ProductEntity,
      StoreEntity,
    ]),
    ProvidersModule,
  ],
  providers: [InventoryService],
  controllers: [InventoryController],
  exports: [InventoryService],
})
export class InventoryModule {}
