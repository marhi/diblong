import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PatchProductDto } from './dto/patch-product.dto';
import { PatchProductTranslationDto } from './dto/patch-product-translation.dto';
import { PatchCategoryDto } from './dto/patch-category.dto';
import { PatchCategoryTranslationDto } from './dto/patch-category-translation.dto';

@ApiTags('admin-catalog')
@Controller('admin/catalog')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN, RoleName.STAFF)
@ApiBearerAuth()
export class AdminCatalogController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('products')
  products() {
    return this.prisma.product.findMany({
      orderBy: { sku: 'asc' },
      include: {
        translations: true,
        images: { include: { media: true } },
        category: { include: { translations: true } },
      },
    });
  }

  @Get('products/:id')
  product(@Param('id') id: string) {
    return this.prisma.product.findUniqueOrThrow({
      where: { id },
      include: {
        translations: true,
        images: { include: { media: true } },
        category: { include: { translations: true } },
      },
    });
  }

  @Get('categories')
  categories() {
    return this.prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { translations: true },
    });
  }

  @Get('categories/:id')
  category(@Param('id') id: string) {
    return this.prisma.category.findUniqueOrThrow({
      where: { id },
      include: { translations: true, products: { select: { id: true, sku: true } } },
    });
  }

  @Patch('products/:id')
  patchProduct(@Param('id') id: string, @Body() dto: PatchProductDto) {
    const data: Prisma.ProductUpdateInput = {};
    if (dto.price !== undefined) data.price = dto.price;
    if (dto.compareAtPrice !== undefined) data.compareAtPrice = dto.compareAtPrice;
    if (dto.stock !== undefined) data.stock = dto.stock;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.isFeatured !== undefined) data.isFeatured = dto.isFeatured;
    if (dto.isBestseller !== undefined) data.isBestseller = dto.isBestseller;
    if (dto.popularity !== undefined) data.popularity = dto.popularity;
    if (dto.categoryId !== undefined) {
      data.category = dto.categoryId
        ? { connect: { id: dto.categoryId } }
        : { disconnect: true };
    }
    return this.prisma.product.update({
      where: { id },
      data,
      include: { translations: true, images: { include: { media: true } } },
    });
  }

  @Patch('products/:productId/translations/:translationId')
  async patchProductTranslation(
    @Param('productId') productId: string,
    @Param('translationId') translationId: string,
    @Body() dto: PatchProductTranslationDto,
  ) {
    await this.prisma.productTranslation.findFirstOrThrow({
      where: { id: translationId, productId },
    });
    return this.prisma.productTranslation.update({
      where: { id: translationId },
      data: dto,
    });
  }

  @Patch('categories/:id')
  patchCategory(@Param('id') id: string, @Body() dto: PatchCategoryDto) {
    return this.prisma.category.update({
      where: { id },
      data: dto,
      include: { translations: true },
    });
  }

  @Patch('categories/:categoryId/translations/:translationId')
  async patchCategoryTranslation(
    @Param('categoryId') categoryId: string,
    @Param('translationId') translationId: string,
    @Body() dto: PatchCategoryTranslationDto,
  ) {
    await this.prisma.categoryTranslation.findFirstOrThrow({
      where: { id: translationId, categoryId },
    });
    return this.prisma.categoryTranslation.update({
      where: { id: translationId },
      data: dto,
    });
  }
}
