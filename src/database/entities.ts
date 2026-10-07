import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
@Entity("brands")
export class BrandEntity {
  @PrimaryGeneratedColumn("uuid") id: string;
  @Index({ unique: true }) @Column({ length: 32 }) code: string;
  @Column({ length: 80 }) name: string;
  @Column({ default: true }) enabled: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
@Entity("products")
@Index(["brandId", "productCode"], { unique: true })
export class ProductEntity {
  @PrimaryGeneratedColumn("uuid") id: string;
  @Column({ type: "uuid" }) brandId: string;
  @ManyToOne(() => BrandEntity, { nullable: false })
  @JoinColumn({ name: "brandId" })
  brand: BrandEntity;
  @Column({ length: 100, nullable: true }) productNo?: string;
  @Column({ length: 100 }) productCode: string;
  @Column({ length: 100, nullable: true }) barcode?: string;
  @Column({ length: 255 }) name: string;
  @Column({ type: "int", nullable: true }) price?: number;
  @Column({ length: 100, nullable: true }) smCd?: string;
  @Column({ length: 100, nullable: true }) stokMngCd?: string;
  @Column({ type: "int", nullable: true }) stokMngQty?: number;
  @Column({ length: 100, nullable: true }) stockApplicationRate?: string;
  @Column({ type: "simple-json", nullable: true }) metadata?: unknown;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
@Entity("stores")
@Index(["brandId", "storeCode"], { unique: true })
export class StoreEntity {
  @PrimaryGeneratedColumn("uuid") id: string;
  @Column({ type: "uuid" }) brandId: string;
  @ManyToOne(() => BrandEntity, { nullable: false })
  @JoinColumn({ name: "brandId" })
  brand: BrandEntity;
  @Column({ length: 100 }) storeCode: string;
  @Column({ length: 255 }) name: string;
  @Column({ length: 500, nullable: true }) address?: string;
  @Column({ length: 50, nullable: true }) telephone?: string;
  @Column({ type: "double", nullable: true }) latitude?: number;
  @Column({ type: "double", nullable: true }) longitude?: number;
  @Column({ type: "simple-json", nullable: true }) metadata?: unknown;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
@Entity("inventories")
@Index(["brandId", "productId", "storeId"], { unique: true })
export class InventoryEntity {
  @PrimaryGeneratedColumn("uuid") id: string;
  @Column({ type: "uuid" }) brandId: string;
  @ManyToOne(() => BrandEntity, { nullable: false })
  @JoinColumn({ name: "brandId" })
  brand: BrandEntity;
  @Column({ type: "uuid" }) productId: string;
  @ManyToOne(() => ProductEntity, { nullable: false })
  @JoinColumn({ name: "productId" })
  product: ProductEntity;
  @Column({ type: "uuid" }) storeId: string;
  @ManyToOne(() => StoreEntity, { nullable: false })
  @JoinColumn({ name: "storeId" })
  store: StoreEntity;
  @Column({ type: "int" }) quantity: number;
  @Column({ type: "datetime" }) checkedAt: Date;
  @Column({ type: "simple-json", nullable: true }) metadata?: unknown;
}
@Entity("monitor_targets")
@Index(["productId", "storeId"], { unique: true })
export class MonitorTargetEntity {
  @PrimaryGeneratedColumn("uuid") id: string;
  @Column({ type: "uuid", nullable: true }) productId?: string;
  @ManyToOne(() => ProductEntity, { nullable: true })
  @JoinColumn({ name: "productId" })
  product?: ProductEntity;
  @Column({ type: "uuid", nullable: true }) storeId?: string;
  @ManyToOne(() => StoreEntity, { nullable: true })
  @JoinColumn({ name: "storeId" })
  store?: StoreEntity;
  @Column({ length: 32, nullable: true }) brandCode?: string;
  @Column({ length: 100, nullable: true }) productCode?: string;
  @Column({ length: 100, nullable: true }) storeCode?: string;
  @Column({ default: true }) enabled: boolean;
  @Column({ type: "int", nullable: true }) lastQuantity?: number;
  @Column({ type: "datetime", nullable: true }) lastCheckedAt?: Date;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
