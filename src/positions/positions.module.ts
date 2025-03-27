import { Module } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { PositionsController } from './positions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Position } from './entities/position.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Position]), // Correctly register the Position entity
    AuthModule, // Import AuthModule as a separate module
    UsersModule, // Import UserModule as a separate module
  ],
  controllers: [PositionsController],
  providers: [PositionsService],
})
export class PositionsModule {}