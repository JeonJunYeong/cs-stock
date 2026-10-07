import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  BrandEntity,
  InventoryEntity,
  MonitorTargetEntity,
  ProductEntity,
  StoreEntity,
} from "../../database/entities";
import { SevenElevenClient } from "./seveneleven.client";
import { SevenElevenController } from "./seveneleven.controller";
import { SevenElevenProvider } from "./seveneleven.provider";
import { SevenElevenService } from "./seveneleven.service";
@Module({
  imports: [
    TypeOrmModule.forFeature([
      BrandEntity,
      ProductEntity,
      StoreEntity,
      InventoryEntity,
      MonitorTargetEntity,
    ]),
  ],
  controllers: [SevenElevenController],
  providers: [SevenElevenClient, SevenElevenProvider, SevenElevenService],
  exports: [SevenElevenProvider, SevenElevenService],
})
export class SevenElevenModule {}
