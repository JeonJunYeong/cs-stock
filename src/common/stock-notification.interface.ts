import { Inventory } from "./types/inventory.type";
export interface StockChangedEvent {
  previousQuantity: number | null;
  current: Inventory;
  kind: "AVAILABLE" | "INCREASED" | "SOLD_OUT";
}
export interface StockNotificationProvider {
  notify(event: StockChangedEvent): Promise<void>;
}
