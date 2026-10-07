import { Module } from '@nestjs/common';
import { Emart24Provider } from './emart24/emart24.provider';
import { SevenElevenProvider } from './seveneleven/seveneleven.provider';
import { Gs25Provider } from './gs25/gs25.provider';
import { CuProvider } from './cu/cu.provider';
import { ProviderRegistry } from './provider.registry';
@Module({ providers: [Emart24Provider, SevenElevenProvider, Gs25Provider, CuProvider, ProviderRegistry], exports: [ProviderRegistry, Emart24Provider, SevenElevenProvider, Gs25Provider, CuProvider] })
export class ProvidersModule {}
