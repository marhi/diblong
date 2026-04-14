import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UsersService } from './users.service';
import { PatchUserDto } from './dto/patch-user.dto';
import { PatchUserRolesDto } from './dto/patch-user-roles.dto';

@ApiTags('admin-users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
@ApiBearerAuth()
export class AdminUsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list() {
    return this.users.adminList();
  }

  @Patch(':id')
  patch(@Param('id') id: string, @Body() dto: PatchUserDto) {
    return this.users.adminPatchUser(id, dto);
  }

  @Patch(':id/roles')
  roles(@Param('id') id: string, @Body() dto: PatchUserRolesDto) {
    return this.users.adminSetRoles(id, dto.roles);
  }
}
