import { Global, Module } from '@nestjs/common';
import { TypeSafeService } from './typesafe.service';
import { RedisModule } from '../redis/redis.module';

@Global()
@Module({
  imports: [RedisModule],
  providers: [TypeSafeService],
  exports: [TypeSafeService],
})
export class TypeSafeModule {}
