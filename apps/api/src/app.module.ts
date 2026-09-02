import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './modules/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { CustomerModule } from './modules/customer/customer.module';
import { ConversationModule } from './modules/conversation/conversation.module';
import { KnowledgeModule } from './modules/knowledge-base/knowledge.module';
import { CrmModule } from './modules/crm/crm.module';
import { AppointmentModule } from './modules/appointment/appointment.module';
import { VoiceModule } from './modules/voice/voice.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { ChatModule } from './modules/chat/chat.module';
import { AiModule } from './modules/ai/ai.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AutomationModule } from './modules/automation/automation.module';
import { StorageModule } from './modules/storage/storage.module';
import { StaffModule } from './modules/staff/staff.module';
import { ServiceModule } from './modules/service/service.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthModule } from './modules/health/health.module';

import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CryptoModule } from './common/crypto/crypto.module';
import { SecurityModule } from './common/security/security.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds sliding window
        limit: 120, // 120 requests/min per IP
      },
    ]),
    CryptoModule,
    SecurityModule,
    BullModule.forRootAsync({
      useFactory: () => ({
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
        },
      }),
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    TenantModule,
    CustomerModule,
    ConversationModule,
    KnowledgeModule,
    CrmModule,
    AppointmentModule,
    VoiceModule,
    WhatsappModule,
    ChatModule,
    AiModule,
    AnalyticsModule,
    AutomationModule,
    StorageModule,
    StaffModule,
    ServiceModule,
    AdminModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

