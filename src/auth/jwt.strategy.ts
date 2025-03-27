import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtPayload } from './jwt-payload.interface';
import { UsersService } from '../users/users.service';  // Import UsersService to get user info
import { User } from '../users/users.entity'; // Import the User entity

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'process.env.JWT_SECRET',  // You should store this securely, e.g., in environment variables
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    return this.usersService.findOneByUsername(payload.username);
  }
}
