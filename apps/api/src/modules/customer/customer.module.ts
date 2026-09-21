import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerVoiceController } from './customer-voice.controller';
import { CustomerService } from './customer.service';
import { ConsentController } from './consent.controller';
import { ConsentService } from './consent.service';

@Module({
  controllers: [CustomerVoiceController, CustomerController, ConsentController],
  providers: [CustomerService, ConsentService],
  exports: [CustomerService, ConsentService],
})
export class CustomerModule {}
