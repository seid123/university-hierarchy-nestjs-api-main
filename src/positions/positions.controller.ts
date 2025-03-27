import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  Query, 
  ParseIntPipe, 
  UseGuards, 
  InternalServerErrorException, 
  NotFoundException, 
  BadRequestException,
  Req
} from '@nestjs/common';
import { PositionsService } from './positions.service';
//import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/roles.enum';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';


@ApiTags('Positions')
@Controller('positions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PositionsController {
  private readonly logger = new Logger(PositionsController.name);

  constructor(private readonly positionsService: PositionsService) {}

  @Post()
 // @Roles(Role.Admin)
  @ApiOperation({ summary: 'Create new position (Admin only)' })
  @ApiResponse({ status: 201, description: 'Position created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() createPositionDto: CreatePositionDto) {
    try {
      return await this.positionsService.create(createPositionDto);
    } catch (error) {
      this.logger.error(`Create error: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Position creation failed');
    }
  }

  @Get()
  //@Roles(Role.Admin)
  @ApiOperation({ summary: 'List all positions (Admin/Manager)' })
  @ApiResponse({ status: 200, description: 'Positions retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid pagination parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10
  ) {
    try {
      if (limit > 100) throw new BadRequestException('Maximum limit is 100');
      return await this.positionsService.findAll(page, limit);
    } catch (error) {
      this.logger.error(`FindAll error: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve positions');
    }
  }

  @Get('tree')
  //@Roles(Role.Admin)
  @ApiOperation({ summary: 'Get positions hierarchy tree (Admin/Manager)' })
  @ApiResponse({ status: 200, description: 'Hierarchy tree retrieved' })
  async findAllAsTree() {
    try {
      return await this.positionsService.findAllAsTree();
    } catch (error) {
      this.logger.error(`Tree error: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to load hierarchy');
    }
  }

  @Get(':id')
  //@Roles(Role.Admin)
  @ApiOperation({ summary: 'Get position details (Admin/Manager)' })
  @ApiResponse({ status: 200, description: 'Position details retrieved' })
  @ApiResponse({ status: 404, description: 'Position not found' })
  async findOne(@Param('id') id: string) {
    try {
      const position = await this.positionsService.findOne(id);
      if (!position) throw new NotFoundException(`Position ${id} not found`);
      return position;
    } catch (error) {
      this.logger.error(`FindOne error: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve position');
    }
  }

  @Patch(':id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Update position (Admin only)' })
  @ApiResponse({ status: 200, description: 'Position updated' })
  @ApiResponse({ status: 404, description: 'Position not found' })
  async update(@Param('id') id: string, @Body() dto: UpdatePositionDto) {
    try {
      const existing = await this.positionsService.findOne(id);
      if (!existing) throw new NotFoundException(`Position ${id} not found`);
      return await this.positionsService.update(id, dto);
    } catch (error) {
      this.logger.error(`Update error: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Update failed');
    }
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Delete position (Admin only)' })
  @ApiResponse({ status: 200, description: 'Position deleted' })
  @ApiResponse({ status: 404, description: 'Position not found' })
  async remove(@Param('id') id: string) {
    try {
      const existing = await this.positionsService.findOne(id);
      if (!existing) throw new NotFoundException(`Position ${id} not found`);
      return await this.positionsService.remove(id);
    } catch (error) {
      this.logger.error(`Delete error: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Deletion failed');
    }
  }

  @Get(':id/children')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Get position children (Admin/Manager)' })
  @ApiResponse({ status: 200, description: 'Children retrieved' })
  async getChildren(@Param('id') id: string) {
    try {
      const parent = await this.positionsService.findOne(id);
      if (!parent) throw new NotFoundException(`Position ${id} not found`);
      return await this.positionsService.findChildren(id);
    } catch (error) {
      this.logger.error(`Children error: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to get children');
    }
  }

  @Get('public/list')
  @ApiOperation({ summary: 'Public position list' })
  @ApiResponse({ status: 200, description: 'Public list retrieved' })
  async publicList() {
    try {
      return await this.positionsService.getPublicList();
    } catch (error) {
      this.logger.error(`Public list error: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to load public data');
    }
  }
}