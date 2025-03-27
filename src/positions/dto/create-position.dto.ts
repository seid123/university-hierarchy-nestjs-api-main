import { IsNotEmpty, IsOptional, IsString, IsUUID, IsIn, ValidateIf, ValidationArguments, registerDecorator } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Custom validator to ensure parentId is null when type is 'root'
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

export class CreatePositionDto {
  @ApiProperty({ example: 'School of Computing', description: 'Name of the position' })
  @IsNotEmpty({ message: 'Position name is required' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'This school handles computing-related programs.', description: 'Details about the position', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'root', description: 'Type of position', enum: ['root', 'institute', 'school', 'department', 'teacher'] })
  @IsNotEmpty({ message: 'Type is required' })
  @IsString()
  @IsIn(['root', 'institute', 'school', 'department', 'teacher'], { message: 'Invalid position type' })
  type: string;

  @ApiProperty({ example: null, description: 'UUID of the parent position (must be null for root)', required: false, nullable: true })
  @ValidateIf((o) => o.type !== 'root')
  @IsUUID('4', { message: 'Parent ID must be a valid UUID' })
  @IsOptional()
  @IsParentIdNullForRoot()
  parentId?: string | null;
}


