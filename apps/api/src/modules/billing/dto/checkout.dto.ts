import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export class CreateCheckoutSessionDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['starter', 'pro', 'enterprise'])
  plan!: string;

  @IsString()
  @IsOptional()
  successUrl?: string;

  @IsString()
  @IsOptional()
  cancelUrl?: string;
}
