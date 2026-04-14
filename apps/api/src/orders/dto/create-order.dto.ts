import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

class AddressDto {
  @ApiProperty()
  @IsString()
  line1!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiProperty()
  @IsString()
  city!: string;

  @ApiProperty()
  @IsString()
  postalCode!: string;

  @ApiProperty({ example: 'SI' })
  @IsString()
  @MinLength(2)
  countryCode!: string;
}

export class CreateOrderDto {
  @ApiProperty({ required: false, enum: ['sl', 'en', 'hr'] })
  @IsOptional()
  @IsIn(['sl', 'en', 'hr'])
  locale?: 'sl' | 'en' | 'hr';

  @ApiProperty()
  @IsUUID()
  cartId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  guestToken?: string;

  @ApiProperty()
  @IsEmail()
  guestEmail!: string;

  @ApiProperty({ type: AddressDto })
  @IsObject()
  shippingAddress!: AddressDto;
}
