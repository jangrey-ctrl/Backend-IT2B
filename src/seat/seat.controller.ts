import {Controller, Get, Post, Put, Delete, Body, Param, UseGuards,} from '@nestjs/common';

import { SeatService } from './seat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('seat')
export class SeatController {
  constructor(private seatService: SeatService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.seatService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.seatService.findById(+id);
  }

  @Post()
  async create(
    @Body()
    body: {
      seat_code: string;
      bus_id: number;
      seat_number: string;
      seat_status: string;
      role?: string;
    },
  ) {
    return this.seatService.createSeat(
      body.seat_code,
      body.bus_id,
      body.seat_number,
      body.seat_status,
      body.role,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.seatService.updateSeat(+id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.seatService.deleteSeat(+id);
  }
}