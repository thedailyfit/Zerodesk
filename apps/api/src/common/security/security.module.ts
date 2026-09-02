import { Global, Module } from '@nestjs/common';
import { PromptGuardService } from './prompt-guard.service';

@Global()
@Module({
  providers: [PromptGuardService],
  exports: [PromptGuardService],
})
export class SecurityModule {}
