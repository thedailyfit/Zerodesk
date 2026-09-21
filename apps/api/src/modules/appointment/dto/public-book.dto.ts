import { IsString, IsNotEmpty, IsOptional, Matches, IsBoolean } from 'class-validator';

export class PublicBookDto {
  @IsString()
  @IsNotEmpty({ message: 'Clinic slug is required' })
  slug!: string;

  @IsString()
  @IsNotEmpty({ message: 'Customer name is required' })
  customerName!: string;

  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^[+]?[0-9\s-]{8,20}$/, { message: 'Invalid phone number format' })
  customerPhone!: string;

  @IsString()
  @IsOptional()
  serviceName?: string;

  @IsString()
  @IsOptional()
  doctorName?: string;

  @IsString()
  @IsOptional()
  staffId?: string;

  @IsBoolean()
  @IsOptional()
  allowAlternativeDoctor?: boolean;

  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  time?: string;

  @IsString()
  @IsOptional()
  dateTime?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsNotEmpty({ message: 'Verification code (OTP) is required' })
  otp!: string;

  /**
   * Anti-bot honeypot field. Invisible in the frontend UI.
   * Legitimate users never see or fill this field. Bots auto-fill it.
   */
  @IsString()
  @IsOptional()
  hp_company_field?: string;
}

export class SendOtpDto {
  @IsString()
  @IsNotEmpty({ message: 'Clinic slug is required' })
  slug!: string;

  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^[+]?[0-9\s-]{8,20}$/, { message: 'Invalid phone number format' })
  phone!: string;
}
