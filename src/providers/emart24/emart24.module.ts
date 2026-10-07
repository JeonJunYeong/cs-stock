import { Module } from '@nestjs/common'; import { Emart24Client } from './emart24.client'; import { Emart24Provider } from './emart24.provider';
@Module({ providers: [Emart24Client, Emart24Provider], exports: [Emart24Provider] }) export class Emart24Module {}
