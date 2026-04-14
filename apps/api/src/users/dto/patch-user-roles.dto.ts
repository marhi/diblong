import { ApiProperty } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';
import { IsArray, IsEnum } from 'class-validator';

export class PatchUserRolesDto {
  @ApiProperty({ enum: RoleName, isArray: true })
  @IsArray()
  @IsEnum(RoleName, { each: true })
  roles!: RoleName[];
}
