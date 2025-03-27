import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// @Controller('profile')
// export class AppController {
//   @UseGuards(AuthGuard('jwt'))
//   @Get()
//   getProfile(@Request() req) {
//     return req.user; // Returns user details from JWT payload
//   }
//}
