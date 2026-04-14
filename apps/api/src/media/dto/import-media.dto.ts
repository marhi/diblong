import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class ImportMediaDto {
  @ApiProperty()
  @IsUrl({ require_protocol: true })
  url!: string;
}
