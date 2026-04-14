import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { CatalogService } from './catalog.service';

@ApiTags('catalog')
@Public()
@Controller('store/:locale')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('categories')
  categories(@Param('locale') locale: string) {
    const loc = this.catalog.assertLocale(locale);
    return this.catalog.listCategories(loc);
  }

  @Get('categories/:slug')
  category(@Param('locale') locale: string, @Param('slug') slug: string) {
    const loc = this.catalog.assertLocale(locale);
    return this.catalog.getCategoryBySlug(loc, slug);
  }

  @Get('products')
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'featured', required: false })
  @ApiQuery({ name: 'bestseller', required: false })
  products(
    @Param('locale') locale: string,
    @Query('q') q?: string,
    @Query('category') category?: string,
    @Query('sort') sort?: 'popularity' | 'newest' | 'price_asc' | 'price_desc',
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('featured') featured?: string,
    @Query('bestseller') bestseller?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const loc = this.catalog.assertLocale(locale);
    return this.catalog.listProducts(loc, {
      q,
      categorySlug: category,
      sort,
      minPrice: minPrice != null ? Number(minPrice) : undefined,
      maxPrice: maxPrice != null ? Number(maxPrice) : undefined,
      featured: featured === '1' || featured === 'true',
      bestseller: bestseller === '1' || bestseller === 'true',
      skip: skip != null ? Number(skip) : undefined,
      take: take != null ? Number(take) : undefined,
    });
  }

  @Get('products/:slug')
  product(@Param('locale') locale: string, @Param('slug') slug: string) {
    const loc = this.catalog.assertLocale(locale);
    return this.catalog.getProductBySlug(loc, slug);
  }

  @Get('search/suggest')
  suggest(@Param('locale') locale: string, @Query('q') q: string) {
    const loc = this.catalog.assertLocale(locale);
    return this.catalog.searchSuggest(loc, q ?? '');
  }
}
