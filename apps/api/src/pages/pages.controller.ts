import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Locale } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { CatalogService } from '../catalog/catalog.service';
import { PagesService } from './pages.service';

@ApiTags('pages')
@Public()
@Controller('store/:locale/pages')
export class PagesController {
  constructor(
    private readonly pages: PagesService,
    private readonly catalog: CatalogService,
  ) {}

  @Get(':slug')
  get(
    @Param('locale') locale: string,
    @Param('slug') slug: string,
  ) {
    const loc = this.catalog.assertLocale(locale) as Locale;
    return this.pages.getBySlug(loc, slug);
  }
}
