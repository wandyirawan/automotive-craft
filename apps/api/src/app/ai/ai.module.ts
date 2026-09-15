import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { createAiProvider, AI_PROVIDER } from "./ai.factory";

@Module({
  providers: [
    {
      provide: AI_PROVIDER,
      useFactory: (config: ConfigService) => createAiProvider(config),
      inject: [ConfigService],
    },
  ],
  exports: [AI_PROVIDER],
})
export class AiModule {}
