import { Injectable, Logger } from "@nestjs/common";
import { Interval } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MonitorTargetEntity } from "../database/entities";
import { ProviderRegistry } from "../providers/provider.registry";
import {
  StockChangedEvent,
  StockNotificationProvider,
} from "../common/stock-notification.interface";
@Injectable()
export class StockMonitorService {
  private readonly logger = new Logger(StockMonitorService.name);
  private notifications: StockNotificationProvider[] = [];
  constructor(
    @InjectRepository(MonitorTargetEntity)
    private targets: Repository<MonitorTargetEntity>,
    private registry: ProviderRegistry,
  ) {}
  registerNotificationProvider(provider: StockNotificationProvider) {
    this.notifications.push(provider);
  }
  @Interval(Number(process.env.POLL_INTERVAL_MS) || 60000) async poll() {
    const targets = await this.targets.find({ where: { enabled: true } });
    for (const t of targets) {
      try {
        const brandCode = t.brandCode;
        const productCode = t.productCode;
        const storeCode = t.storeCode;
        if (!brandCode || !productCode || !storeCode) continue;
        const [row] = await this.registry
          .get(brandCode)
          .getInventory(productCode, [storeCode]);
        if (!row) continue;
        const previous = t.lastQuantity ?? null;
        await this.targets.update(t.id, {
          lastQuantity: row.quantity,
          lastCheckedAt: row.checkedAt,
        });
        if (previous !== null && previous !== row.quantity) {
          const event: StockChangedEvent = {
            previousQuantity: previous,
            current: row,
            kind:
              previous === 0 && row.quantity > 0
                ? "AVAILABLE"
                : row.quantity === 0
                  ? "SOLD_OUT"
                  : "INCREASED",
          };
          for (const notifier of this.notifications)
            await notifier.notify(event);
        }
      } catch (e) {
        this.logger.warn(
          `Monitor target ${t.id} failed: ${e instanceof Error ? e.message : "unknown error"}`,
        );
      }
    }
  }
}
