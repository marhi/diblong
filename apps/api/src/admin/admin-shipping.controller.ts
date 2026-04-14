import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class PatchShippingCountryDto {
  @IsOptional()
  @IsString()
  notesSl?: string;

  @IsOptional()
  @IsString()
  notesEn?: string;

  @IsOptional()
  @IsString()
  notesHr?: string;
}

class PatchShippingRateDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  flatRate?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  freeShippingThreshold?: number | null;
}

@ApiTags('admin-shipping')
@Controller('admin/shipping')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN, RoleName.STAFF)
@ApiBearerAuth()
export class AdminShippingController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async tree() {
    return this.prisma.shippingZone.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        countries: { orderBy: { code: 'asc' } },
        rates: true,
      },
    });
  }

  @Patch('countries/:id')
  patchCountry(@Param('id') id: string, @Body() dto: PatchShippingCountryDto) {
    return this.prisma.shippingCountry.update({
      where: { id },
      data: dto,
    });
  }

  @Patch('rates/:id')
  patchRate(@Param('id') id: string, @Body() dto: PatchShippingRateDto) {
    const data: Record<string, unknown> = {};
    if (dto.flatRate != null) data.flatRate = dto.flatRate;
    if (dto.freeShippingThreshold !== undefined) {
      data.freeShippingThreshold = dto.freeShippingThreshold;
    }
    return this.prisma.shippingRate.update({
      where: { id },
      data,
    });
  }
}
