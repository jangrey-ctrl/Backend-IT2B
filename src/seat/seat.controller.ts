
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';

import { SeatService } from './seat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('seat')
@UseGuards(JwtAuthGuard)
export class SeatController {
  constructor(private seatService: SeatService) {}

  private checkAdmin(request: any) {
    if (request.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
  }

  @Get()
  async getAll() {
    return this.seatService.getAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.seatService.findById(+id);
  }

  @Post()
  async create(@Body() body: {
    seat_code: string;
    bus_id: number;
    seat_number: string;
    seat_status: string;
    role?: string;
  }, @Request() request: any) {
    this.checkAdmin(request);

    return this.seatService.createSeat(
      body.seat_code,
      body.bus_id,
      body.seat_number,
      body.seat_status,
      body.role,
    );
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Request() request: any) {
    this.checkAdmin(request);
    return this.seatService.updateSeat(+id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() request: any) {
    this.checkAdmin(request);
    return this.seatService.deleteSeat(+id);
  }
}
