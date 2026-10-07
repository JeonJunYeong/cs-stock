import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MonitorTargetEntity } from "../database/entities";
import { ProvidersModule } from "../providers/providers.module";
import { InventoryModule } from "../inventory/inventory.module";
import { StockMonitorService } from "./stock-monitor.service";
import { MonitorController } from "./monitor.controller";
@Module({
  imports: [
    TypeOrmModule.forFeature([MonitorTargetEntity]),
    ProvidersModule,
    InventoryModule,
  ],
  providers: [StockMonitorService],
  controllers: [MonitorController],
})
export class MonitorModule {}
