import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('positions')
export class Position {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Unique identifier for the position' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'School of Computing', description: 'Name of the position' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @ApiProperty({ example: 'This school handles computing-related programs.', description: 'Description of the position', required: false })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001', description: 'Parent position ID (null for root)', required: false })
  @Column({ type: 'uuid', nullable: true })
  parentId?: string;

  @ApiProperty({ example: 'school', description: 'Type of position', enum: ['root', 'institute', 'school', 'department', 'teacher'] })
  @Column({ type: 'varchar', length: 50, nullable: false })
  type: string;

  @ManyToOne(() => Position, (position) => position.children, { nullable: true, onDelete: 'CASCADE' })
  parent: Position | null;

  @OneToMany(() => Position, (position) => position.parent)
  children: Position[];
}
