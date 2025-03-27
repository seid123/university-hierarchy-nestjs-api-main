import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { validate } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { Position } from './entities/position.entity';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionsService {
  constructor(
    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>,
  ) {}

  // ✅ Create a new position
  async create(dto: CreatePositionDto): Promise<{ message: string; position: Position }> {
    const { name, description, parentId, type } = dto;

    if (type === 'root') {
      const existingRoot = await this.positionRepository.findOne({ where: { type: 'root' } });
      if (existingRoot) {
        throw new BadRequestException('A root position already exists.');
      }
    }

    if (['root', 'institute', 'department', 'school'].includes(type)) {
      const existingPosition = await this.positionRepository.findOne({ where: { name, type } });
      if (existingPosition) {
        throw new BadRequestException(`Position "${name}" of type "${type}" already exists.`);
      }
    }

    const position = new Position();
    position.name = name;
    position.description = description ?? null;
    position.type = type;

    if (type === 'root' && parentId !== null) {
      throw new BadRequestException('Root position must have parentId as null.');
    }

    if (type !== 'root' && !parentId) {
      throw new BadRequestException('Non-root positions must have a valid parentId.');
    }

    if (parentId) {
      const parent = await this.positionRepository.findOne({ where: { id: parentId } });
      if (!parent) throw new NotFoundException('Parent position not found');
      position.parent = parent;
    }

    const savedPosition = await this.positionRepository.save(position);
    return { message: 'Position created successfully', position: savedPosition };
  }

  // ✅ Fetch all positions with pagination
  async findAll(page: number, limit: number): Promise<{ data: Position[]; total: number }> {
    const [data, total] = await this.positionRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  // ✅ Fetch positions as a full tree structure
  async findAllAsTree(): Promise<Position[]> {
    return this.positionRepository.find({ relations: ['children'] });
  }

  // ✅ Fetch direct children of a position
  async findChildren(id: string): Promise<Position[]> {
    const parent = await this.positionRepository.findOne({ where: { id } });
    if (!parent) throw new NotFoundException('Position not found');
    return this.positionRepository.find({ where: { parent: { id } } });
  }

  // ✅ Find position by ID or Name
  async findOne(idOrName: string): Promise<Position> {
    let position: Position | null;

    if (validate(idOrName)) {
      position = await this.positionRepository.findOne({ where: { id: idOrName } });
    } else {
      position = await this.positionRepository.findOne({ where: { name: idOrName } });
    }

    if (!position) throw new NotFoundException('Position not found');
    return position;
  }
  async update(id: string, dto: UpdatePositionDto): Promise<Position> {
    console.log(`Updating position with ID: ${id}`);

    const position = await this.positionRepository.findOne({ where: { id } });
    if (!position) throw new NotFoundException('Position not found');
    console.log(`Fetched position: ${JSON.stringify(position)}`);

    if (dto.name && ['root', 'institute', 'department', 'school'].includes(position.type)) {
      console.log(`Checking for duplicate name: ${dto.name}`);
      const existing = await this.positionRepository.findOne({ where: { name: dto.name, type: position.type } });
      if (existing && existing.id !== id) {
        throw new BadRequestException(`Position "${dto.name}" of type "${position.type}" already exists.`);
      }
    }

    position.name = dto.name ?? position.name;
    position.description = dto.description ?? position.description;
    position.type = dto.type ?? position.type;

    if (dto.parentId) {
      console.log(`Validating parentId: ${dto.parentId}`);

      if (dto.parentId === id) {
        throw new BadRequestException('A position cannot be its own parent.');
      }

      const parent = await this.positionRepository.findOne({ where: { id: dto.parentId } });
      if (!parent) throw new NotFoundException('Parent position not found');

      console.log(`Checking for cyclic dependency`);
      if (await this.isCyclicDependency(parent, id)) {
        throw new BadRequestException('Cannot create a cyclic hierarchy.');
      }

      position.parent = parent;
    }

    console.log(`Saving updated position`);
    return this.positionRepository.save(position);
}


  // ✅ Delete a position safely
  async remove(id: string): Promise<{ message: string }> {
    try {
      console.log(`Attempting to delete position with ID: ${id}`);

      const position = await this.positionRepository.findOne({
        where: { id },
        relations: ['children'],
      });

      if (!position) {
        console.warn(`Position with ID ${id} not found`);
        throw new NotFoundException('Position not found');
      }

      if (position.children?.length > 0) {
        console.warn(`Cannot delete position with ID ${id} because it has child positions`);
        throw new BadRequestException('Cannot delete a position that has child positions.');
      }

      await this.positionRepository.delete(id); // Delete instead of remove
      console.log(`Position with ID ${id} deleted successfully`);

      return { message: 'Position deleted successfully' };
    } catch (error) {
      console.error('cannt deleting this position:', error);
      throw new InternalServerErrorException('Failed to delete position');
    }
  }

  // ✅ Check cyclic dependency
  private async isCyclicDependency(parent: Position, childId: string): Promise<boolean> {
    while (parent) {
      if (parent.id === childId) {
        return true;
      }
      parent = await this.positionRepository.findOne({ where: { id: parent.parent?.id } });
    }
    return false;
  }

  async getPublicList(): Promise<Partial<Position>[]> {
    try {
      return await this.positionRepository
        .createQueryBuilder('position')
        .select([
          'position.id',
          'position.title',
          'position.description',
          'position.createdAt'
        ])
        .where('position.isPublic = :isPublic', { isPublic: true })
        .orderBy('position.createdAt', 'DESC')
        .getMany();
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve public positions');
    }
  }
}
