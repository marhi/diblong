import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Locale } from '@prisma/client';

class PromoTranslationPatch {
  locale!: Locale;
  @IsOptional()
  @IsString()
  headline?: string;

  @IsOptional()
  @IsString()
  subline?: string;

  @IsOptional()
  @IsString()
  ctaLabel?: string;

  @IsOptional()
  @IsString()
  ctaPath?: string;
}

class PatchPromoBannerDto {
  @IsOptional()
  @Type(() => Number)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  linkUrl?: string;

  @IsOptional()
  @IsString()
  imageMediaId?: string | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PromoTranslationPatch)
  translations?: PromoTranslationPatch[];
}

@ApiTags('admin-promo')
@Controller('admin/promo')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN, RoleName.STAFF)
@ApiBearerAuth()
export class AdminPromoController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('banners')
  banners() {
    return this.prisma.promoBanner.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { translations: true, image: true },
    });
  }

  @Get('banners/:id')
  banner(@Param('id') id: string) {
    return this.prisma.promoBanner.findUniqueOrThrow({
      where: { id },
      include: { translations: true, image: true },
    });
  }

  @Patch('banners/:id')
  async patchBanner(@Param('id') id: string, @Body() dto: PatchPromoBannerDto) {
    const { translations, ...rest } = dto;
    const bannerData: Prisma.PromoBannerUpdateInput = {};
    if (rest.sortOrder !== undefined) bannerData.sortOrder = rest.sortOrder;
    if (rest.isActive !== undefined) bannerData.isActive = rest.isActive;
    if (rest.linkUrl !== undefined) bannerData.linkUrl = rest.linkUrl;
    if (rest.imageMediaId !== undefined) {
      bannerData.image =
        rest.imageMediaId === null
          ? { disconnect: true }
          : { connect: { id: rest.imageMediaId } };
    }
    if (Object.keys(bannerData).length) {
      await this.prisma.promoBanner.update({
        where: { id },
        data: bannerData,
      });
    }
    if (translations?.length) {
      for (const t of translations) {
        const data: Prisma.PromoBannerTranslationUpdateManyMutationInput = {};
        if (t.headline !== undefined) data.headline = t.headline;
        if (t.subline !== undefined) data.subline = t.subline;
        if (t.ctaLabel !== undefined) data.ctaLabel = t.ctaLabel;
        if (t.ctaPath !== undefined) data.ctaPath = t.ctaPath;
        if (Object.keys(data).length) {
          await this.prisma.promoBannerTranslation.updateMany({
            where: { bannerId: id, locale: t.locale },
            data,
          });
        }
      }
    }
    return this.prisma.promoBanner.findUniqueOrThrow({
      where: { id },
      include: { translations: true, image: true },
    });
  }
}
