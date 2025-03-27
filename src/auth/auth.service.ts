import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service'; // Import the UsersService to find users
import { User } from '../users/users.entity'; // The User entity
import { JwtPayload } from './jwt-payload.interface'; // Define the payload structure

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Validate the user and check credentials
  async validateUser(username: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findOneByUsername(username);
    if (user && user.password === pass) {  // Add hashing logic if needed
      return user;
    }
    return null;
  }

  // Login and return a JWT
  async login(user: User) {
    const payload: JwtPayload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
