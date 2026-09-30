import { IsBoolean, IsIn, IsObject, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateAutomationDto {
  @IsString() @MinLength(1) @MaxLength(120) name!: string;
  @IsOptional() @IsString() @MaxLength(60) category?: string;
  @IsString() @MinLength(1) @MaxLength(60) triggerType!: string;
  @IsOptional() @IsObject() definition?: Record<string, any>;
}
export class UpdateAutomationDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(120) name?: string;
  @IsOptional() @IsString() @MaxLength(60) category?: string;
  @IsOptional() @IsString() @MinLength(1) @MaxLength(60) triggerType?: string;
  @IsOptional() @IsObject() definition?: Record<string, any>;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
export class TriggerAutomationDto {
  @IsUUID() workflowId!: string;
  @IsUUID() requestId!: string;
  @IsOptional() @IsObject() payload?: Record<string, any>;
}
