import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private userService: UsersService,private jwtService: JwtService,) {}

  async validateUser(username: string, pass: string) {
    const user = await this.userService.findByUsername(username);
    if (!user) return null;
    const valid = await bcrypt.compare(pass, user.password);
    if (valid) { return {id: user.id, username: user.username, role: user.role,};
    }

    return null;
  }

  async login(user: { id: number; username: string; role: string }) {
    const payload = {sub: user.id, username: user.username, role: user.role};
    const accessToken = this.jwtService.sign(payload);

    // create fresh token using separate secret so you can revoke access by changing refresh secret
    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret',
      {expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',} as jwt.SignOptions,
    );

    await this.userService.setRefreshToken(user.id, refreshToken);

    return {accessToken, refreshToken};
  }

  async logout(userId: number) {
    await this.userService.setRefreshToken(userId, null);
    return {ok: true};
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded: any = jwt.verify(refreshToken,process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret');
      const user = await this.userService.findById(decoded.sub);
      if (!user) {throw new UnauthorizedException('Invalid refresh token');
      };
      const found = await this.userService.findByRefreshToken(refreshToken);
      if (!found) {throw new UnauthorizedException(
          'Invalid refresh token (not found)',
        );
      }

      const payload = {sub: found.id, username: found.username, role: found.role};
      const accessToken = this.jwtService.sign(payload);
      const newRefresh = jwt.sign(
        payload,
        process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret',
        {expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'} as jwt.SignOptions,
      );

      await this.userService.setRefreshToken(found.id, newRefresh);   
      return {accessToken, refreshToken: newRefresh};
    } catch (err) {
      throw new UnauthorizedException('Could not refresh tokens');
    }
  }
}