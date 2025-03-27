import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { Role } from '../auth/roles.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UsersDto {
  @ApiProperty({ example: 'john_doe' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ example: 'StrongPass!123' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ example: [Role.User], enum: Role, isArray: true })
  @IsArray()
  @IsString({ each: true })
  roles: Role[];
}