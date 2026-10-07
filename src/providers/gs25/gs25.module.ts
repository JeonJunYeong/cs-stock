import { Module } from "@nestjs/common";
import { Gs25Client } from "./gs25.client";
import { Gs25Provider } from "./gs25.provider";
@Module({ providers: [Gs25Client, Gs25Provider], exports: [Gs25Provider] })
export class Gs25Module {}
