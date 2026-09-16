import { Module } from '@nestjs/common';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';

import { KycController } from './kyc.controller';

@Module({
  controllers: [TenantController, KycController],
  providers: [TenantService],
})
export class TenantModule {}
