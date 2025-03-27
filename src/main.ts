import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('University Hierarchy API')
    .setDescription('Manage university positions hierarchically')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Keeps token active in Swagger UI
    },
  });

  // ✅ Enable CORS for frontend requests
  app.enableCors({
    origin: '*', // Allow all origins (Change this for security)
    //origin: ['http://localhost:3000'], // Allow specific origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    //credentials: true, // Allow sending cookies if needed
  });

  // ✅ Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Remove unknown properties
    forbidNonWhitelisted: true, // Throw error on unknown properties
    transform: true, // Auto-transform payloads to DTOs
    transformOptions: {
      enableImplicitConversion: true, // Convert types automatically
    },
    disableErrorMessages: false, // Show detailed validation errors
  }));

  await app.listen(3000);
 // console.log('🚀 Server running on http://localhost:3000');
  console.log('📄 Swagger API Docs: http://localhost:3000');
}

bootstrap();
