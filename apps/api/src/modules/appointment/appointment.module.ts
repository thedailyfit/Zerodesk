import { forwardRef, Module } from '@nestjs/common';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { CalendarSyncService } from './calendar-sync.service';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [forwardRef(() => WhatsappModule)],
  controllers: [AppointmentController],
  providers: [AppointmentService, CalendarSyncService],
  exports: [AppointmentService, CalendarSyncService],
})
export class AppointmentModule {}
