import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { IsOptional, IsString } from 'class-validator';

class PatchPageTranslationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  bodyHtml?: string;

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
}

@ApiTags('admin-pages')
@Controller('admin/pages')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN, RoleName.STAFF)
@ApiBearerAuth()
export class AdminPagesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('cms')
  listCms() {
    return this.prisma.page.findMany({
      orderBy: { key: 'asc' },
      include: { translations: { orderBy: { locale: 'asc' } } },
    });
  }

  @Patch('cms/translations/:id')
  patchTranslation(@Param('id') id: string, @Body() dto: PatchPageTranslationDto) {
    return this.prisma.pageTranslation.update({
      where: { id },
      data: dto,
    });
  }
}
