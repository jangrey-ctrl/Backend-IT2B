
import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  // ADMIN ROLE CHECK
  private checkAdmin(request: any) {
    if (request.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
  }

  // GET ALL USERS - ADMIN ONLY
  @Get()
  async getAll(@Request() request: any) {
    this.checkAdmin(request);
    return this.usersService.getAll();
  }

  // GET SINGLE USER - ADMIN ONLY
  @Get(':id')
  async getOne(
    @Param('id') id: string,
    @Request() request: any,
  ) {
    this.checkAdmin(request);
    return this.usersService.findById(+id);
  }

  // UPDATE USER - ADMIN ONLY
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @Request() request: any,
  ) {
    this.checkAdmin(request);
    return this.usersService.updateUser(+id, body);
  }

  // DELETE USER - ADMIN ONLY
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Request() request: any,
  ) {
    this.checkAdmin(request);
    return this.usersService.deleteUser(+id);
  }
}
