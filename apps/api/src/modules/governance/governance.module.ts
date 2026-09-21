import { Module } from '@nestjs/common';
import { GovernanceService } from './governance.service';
import { GovernanceController } from './governance.controller';
import { ActionPolicyGuard } from '../../common/guards/action-policy.guard';
import { MemoryQuarantineService } from '../../common/security/memory-quarantine.service';

@Module({
  controllers: [GovernanceController],
  providers: [GovernanceService, ActionPolicyGuard, MemoryQuarantineService],
  exports: [GovernanceService, ActionPolicyGuard, MemoryQuarantineService],
})
export class GovernanceModule {}
