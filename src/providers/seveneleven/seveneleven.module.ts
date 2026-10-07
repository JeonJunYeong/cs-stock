import { Module } from '@nestjs/common'; import { SevenElevenClient } from './seveneleven.client'; import { SevenElevenProvider } from './seveneleven.provider';
@Module({providers:[SevenElevenClient,SevenElevenProvider],exports:[SevenElevenProvider]}) export class SevenElevenModule {}
