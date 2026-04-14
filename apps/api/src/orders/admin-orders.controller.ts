import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleName } from '@prisma/client';
import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { PatchOrderNotesDto } from './dto/patch-order-notes.dto';

@ApiTags('admin-orders')
@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN, RoleName.STAFF)
@ApiBearerAuth()
export class AdminOrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  list() {
    return this.orders.adminList();
  }

  @Get(':id')
  one(@Param('id') id: string) {
    return this.orders.adminGetById(id);
  }

  @Patch(':id/notes')
  notes(@Param('id') id: string, @Body() dto: PatchOrderNotesDto) {
    return this.orders.adminPatchNotes(id, dto.adminNotes);
  }

  @Patch(':id/status')
  status(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.orders.adminUpdateStatus(id, dto.status);
  }
}
