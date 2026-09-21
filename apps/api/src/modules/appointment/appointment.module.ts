import { forwardRef, Module } from '@nestjs/common';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { CalendarSyncService } from './calendar-sync.service';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { OtpService } from '../auth/otp.service';

@Module({
  imports: [forwardRef(() => WhatsappModule)],
  controllers: [AppointmentController],
  providers: [AppointmentService, CalendarSyncService, OtpService],
  exports: [AppointmentService, CalendarSyncService, OtpService],
})
export class AppointmentModule {}
