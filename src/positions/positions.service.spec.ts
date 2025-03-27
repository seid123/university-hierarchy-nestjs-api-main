import { Test, TestingModule } from '@nestjs/testing';
import { PositionsService } from './positions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Position } from './entities/position.entity';
import { Repository } from 'typeorm';

describe('PositionsService', () => {
  let service: PositionsService;
  let repo: Repository<Position>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PositionsService,
        { provide: getRepositoryToken(Position), useClass: Repository },
      ],
    }).compile();

    service = module.get<PositionsService>(PositionsService);
    repo = module.get<Repository<Position>>(getRepositoryToken(Position));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a position', async () => {
    const position = { id: 'uuid-123', name: 'University President', description: 'Head of the university', parent: null };
    jest.spyOn(repo, 'save').mockResolvedValue(position as Position);
    expect(await service.create('University President', 'Head of the university')).toEqual(position);
  });
});
