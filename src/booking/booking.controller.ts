import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';

import { BookingService } from './booking.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('booking')
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.bookingService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.bookingService.findById(+id);
  }

  @Post()
  async create(
    @Body()
    body: {
      booking_code: string;
      passenger_id: number;
      sched_id: number;
      seat_id: number;
      booking_date: string;
      booking_status: string;
    },
  ) {
    return this.bookingService.createBooking(
      body.booking_code,
      body.passenger_id,
      body.sched_id,
      body.seat_id,
      body.booking_date,
      body.booking_status,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.bookingService.updateBooking(+id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.bookingService.deleteBooking(+id);
  }
}