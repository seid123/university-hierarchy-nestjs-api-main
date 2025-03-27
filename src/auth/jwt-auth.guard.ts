import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    // Check if authorization header is present and contains 'Bearer' token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid or missing token');
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verify the JWT token
      const decoded = this.jwtService.verify(token);

      // Optionally, check for additional claims here (e.g., roles)
      // if (decoded.role !== 'admin') {
      //   throw new UnauthorizedException('Insufficient permissions');
      // }

      // Add the decoded user information to the request for use in other parts of your app
      request.user = decoded;
      
      return true;
    } catch (error) {
      // Handle specific error cases (e.g., expired token)
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
