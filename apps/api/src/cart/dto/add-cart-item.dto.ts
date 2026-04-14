import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty()
  @IsUUID()
  productId!: string;

  @ApiProperty({ default: 1 })
  @IsInt()
  @Min(1)
  qty!: number;

  @ApiProperty({ required: false, description: 'Guest cart token from create response' })
  @IsOptional()
  @IsString()
  guestToken?: string;
}
