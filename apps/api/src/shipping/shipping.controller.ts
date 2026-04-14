import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { ShippingService } from './shipping.service';

@ApiTags('shipping')
@Public()
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shipping: ShippingService) {}

  @Get('countries')
  countries() {
    return this.shipping.listCountries();
  }

  @Get('quote')
  quote(@Query('country') country: string, @Query('subtotal') subtotal: string) {
    return this.shipping.quote(country, Number(subtotal ?? '0'));
  }
}
