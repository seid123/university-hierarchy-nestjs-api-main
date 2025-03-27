import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PositionsModule } from './positions/positions.module';
import * as dotenv from 'dotenv';
import { JwtModule } from '@nestjs/jwt';

dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Load environment variables globally
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Import ConfigModule to access environment variables
      inject: [ConfigService], // Inject ConfigService
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres', // Database type
        host: configService.get<string>('DATABASE_HOST'), // Retrieve host from environment variables
        port: configService.get<number>('DATABASE_PORT'), // Convert port to a number
        username: configService.get<string>('DATABASE_USER'), // Retrieve username
        password: configService.get<string>('DATABASE_PASSWORD'), // Retrieve password
        database: configService.get<string>('DATABASE_NAME'), // Retrieve database name
        autoLoadEntities: true, // Automatically load entities
        synchronize: true, // ⚠️ Use migrations in production
      }),
    }),
    AuthModule, // Ensure AuthModule is imported
    UsersModule,
    PositionsModule,
    ],
})
export class AppModule {}
