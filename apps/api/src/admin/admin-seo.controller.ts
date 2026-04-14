import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Locale, RoleName } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

class UpsertSeoEntryDto {
  @IsString()
  routeKey!: string;

  @IsEnum(Locale)
  locale!: Locale;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsString()
  ogTitle?: string;

  @IsOptional()
  @IsString()
  ogDescription?: string;

  @IsOptional()
  @IsString()
  ogImageUrl?: string;

  @IsOptional()
  @IsString()
  canonicalPath?: string;

  @IsOptional()
  @IsBoolean()
  noindex?: boolean;
}

class PatchSeoEntryDto {
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsString()
  ogTitle?: string;

  @IsOptional()
  @IsString()
  ogDescription?: string;

  @IsOptional()
  @IsString()
  ogImageUrl?: string;

  @IsOptional()
  @IsString()
  canonicalPath?: string;

  @IsOptional()
  @IsBoolean()
  noindex?: boolean;
}

@ApiTags('admin-seo')
@Controller('admin/seo')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN, RoleName.STAFF)
@ApiBearerAuth()
export class AdminSeoController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('entries')
  entries() {
    return this.prisma.seoEntry.findMany({
      orderBy: [{ routeKey: 'asc' }, { locale: 'asc' }],
    });
  }

  @Post('entries')
  upsert(@Body() dto: UpsertSeoEntryDto) {
    return this.prisma.seoEntry.upsert({
      where: { routeKey_locale: { routeKey: dto.routeKey, locale: dto.locale } },
      create: {
        routeKey: dto.routeKey,
        locale: dto.locale,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        ogTitle: dto.ogTitle,
        ogDescription: dto.ogDescription,
        ogImageUrl: dto.ogImageUrl,
        canonicalPath: dto.canonicalPath,
        noindex: dto.noindex ?? false,
      },
      update: {
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        ogTitle: dto.ogTitle,
        ogDescription: dto.ogDescription,
        ogImageUrl: dto.ogImageUrl,
        canonicalPath: dto.canonicalPath,
        noindex: dto.noindex,
      },
    });
  }

  @Patch('entries/:id')
  patch(@Param('id') id: string, @Body() dto: PatchSeoEntryDto) {
    return this.prisma.seoEntry.update({
      where: { id },
      data: dto,
    });
  }
}
