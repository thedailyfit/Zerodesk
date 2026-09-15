import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerVoiceController } from './customer-voice.controller';
import { CustomerService } from './customer.service';

@Module({
  controllers: [CustomerVoiceController, CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
