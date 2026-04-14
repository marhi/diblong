import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Locale } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { CatalogService } from '../catalog/catalog.service';
import { PromoService } from './promo.service';

@ApiTags('promo')
@Public()
@Controller('store/:locale/promos')
export class PromoController {
  constructor(
    private readonly promo: PromoService,
    private readonly catalog: CatalogService,
  ) {}

  @Get('banners')
  banners(@Param('locale') locale: string) {
    const loc = this.catalog.assertLocale(locale) as Locale;
    return this.promo.listBanners(loc);
  }
}
