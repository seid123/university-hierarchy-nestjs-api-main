import { IsNotEmpty, IsOptional, IsString, IsUUID, IsIn, ValidateIf, ValidationArguments, registerDecorator } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


function IsParentIdNullForRoot() {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsParentIdValid',
      target: object.constructor,
      propertyName: propertyName,
      options: { message: 'Parent ID must be null for root and not null for other types' },
      validator: {
        validate(value: any, args: ValidationArguments) {
          const obj = args.object as any;
          if (obj.type === 'root') {
            return value === null || value === undefined;
          }
          return value !== null && value !== undefined; // Must be present for non-root
        },
      },
    });
  };
}

export class UpdatePositionDto {
  @ApiProperty({ example: 'School of Computing', description: 'Name of the position', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Updated description', description: 'Details about the position', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'school', description: 'Type of position', enum: ['root', 'institute', 'school', 'department', 'teacher'], required: false })
  @IsOptional()
  @IsString()
  @IsIn(['root', 'institute', 'school', 'department', 'teacher'], { message: 'Invalid position type' })
  type?: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'UUID of the parent position (must be null for root)', required: false, nullable: true })
  @ValidateIf((o) => o.type !== 'root')
  @IsUUID('4', { message: 'Parent ID must be a valid UUID' })
  @IsOptional()
  @IsParentIdNullForRoot()
  parentId?: string | null;
}