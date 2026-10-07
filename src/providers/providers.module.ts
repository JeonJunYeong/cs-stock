import { Module } from "@nestjs/common";
import { CuModule } from "./cu/cu.module";
import { Emart24Module } from "./emart24/emart24.module";
import { Gs25Module } from "./gs25/gs25.module";
import { ProviderRegistry } from "./provider.registry";
import { SevenElevenModule } from "./seveneleven/seveneleven.module";
@Module({
  imports: [Emart24Module, SevenElevenModule, Gs25Module, CuModule],
  providers: [ProviderRegistry],
  exports: [
    ProviderRegistry,
    Emart24Module,
    SevenElevenModule,
    Gs25Module,
    CuModule,
  ],
})
export class ProvidersModule {}
