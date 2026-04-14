import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

class PatchSettingDto {
  value!: Record<string, unknown>;
}

@ApiTags('admin-settings')
@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
@ApiBearerAuth()
export class AdminSettingsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list() {
    return this.prisma.siteSetting.findMany({ orderBy: { key: 'asc' } });
  }

  @Patch(':key')
  patch(@Param('key') key: string, @Body() dto: PatchSettingDto) {
    return this.prisma.siteSetting.upsert({
      where: { key },
      create: { key, value: dto.value as Prisma.InputJsonValue },
      update: { value: dto.value as Prisma.InputJsonValue },
    });
  }
}
