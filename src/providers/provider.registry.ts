import { Injectable, NotFoundException } from "@nestjs/common";
import { ConvenienceProvider } from "../common/interfaces/convenience-provider.interface";
import { Emart24Provider } from "./emart24/emart24.provider";
import { SevenElevenProvider } from "./seveneleven/seveneleven.provider";
import { Gs25Provider } from "./gs25/gs25.provider";
import { CuProvider } from "./cu/cu.provider";
export type BrandCode = "EMART24" | "SEVEN_ELEVEN" | "GS25" | "CU";
@Injectable()
export class ProviderRegistry {
  private readonly providers: Record<BrandCode, ConvenienceProvider>;
  constructor(
    emart: Emart24Provider,
    seven: SevenElevenProvider,
    gs: Gs25Provider,
    cu: CuProvider,
  ) {
    this.providers = { EMART24: emart, SEVEN_ELEVEN: seven, GS25: gs, CU: cu };
  }
  get(brand: string): ConvenienceProvider {
    const key = brand.toUpperCase() as BrandCode;
    const provider = this.providers[key];
    if (!provider) throw new NotFoundException(`Unsupported brand: ${brand}`);
    return provider;
  }
  brands(): BrandCode[] {
    return Object.keys(this.providers) as BrandCode[];
  }
}
