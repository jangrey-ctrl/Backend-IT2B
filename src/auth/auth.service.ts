
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  // VALIDATE USER
  async validateUser(username: string, pass: string) {
    const user = await this.userService.findByUsername(username);

    if (!user) return null;

    const valid = await bcrypt.compare(pass, user.password);

    if (!valid) return null;

    return {
      id: user.id,
      username: user.username,
      role: user.role,
    };
  }

  // LOGIN
  async login(user: { id: number; username: string; role: string }) {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret',
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
      } as jwt.SignOptions,
    );

    await this.userService.setRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  // LOGOUT
  async logout(userId: number) {
    await this.userService.setRefreshToken(userId, null);

    return {
      ok: true,
    };
  }

  // REFRESH TOKEN
  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret',
      ) as jwt.JwtPayload;

      const userId = Number(decoded.sub);

      if (!userId) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const found = await this.userService.findByRefreshToken(refreshToken);

      if (!found || found.id !== userId) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const payload = {
        sub: found.id,
        username: found.username,
        role: found.role,
      };

      const accessToken = this.jwtService.sign(payload);

      const newRefreshToken = jwt.sign(
        payload,
        process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret',
        {
          expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
        } as jwt.SignOptions,
      );

      await this.userService.setRefreshToken(found.id, newRefreshToken);

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      throw new UnauthorizedException('Could not refresh tokens');
    }
  }
}
