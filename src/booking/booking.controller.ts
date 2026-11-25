import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { BookingService } from './booking.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('booking')
@UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(private bookingService: BookingService) {}

  private checkAdmin(request: any) {
    if (request.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required.');
    }
  }

  @Get()
  async getAll(@Request() request: any) {
    return this.bookingService.getAll(request.user.userId, request.user.role);
  }

  @Get('available-seats/:schedId')
  async getAvailableSeats(@Param('schedId') schedId: string) {
    return this.bookingService.getAvailableSeats(+schedId);
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @Request() request: any) {
    return this.bookingService.findById(+id, request.user.userId, request.user.role);
  }

  @Post()
  async create(@Body() body: { sched_id: number; seat_id: number }, @Request() request: any) {
    if (!body.sched_id || !body.seat_id) {
      throw new ForbiddenException('Schedule and seat are required.');
    }

    return this.bookingService.createBooking(
      request.user.userId,
      Number(body.sched_id),
      Number(body.seat_id),
    );
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Request() request: any) {
    this.checkAdmin(request);
    return this.bookingService.updateBooking(+id, body);
  }

  @Put(':id/cancel')
  async cancel(@Param('id') id: string, @Request() request: any) {
    return this.bookingService.cancelBooking(+id, request.user.userId, request.user.role);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() request: any) {
    this.checkAdmin(request);
    return this.bookingService.deleteBooking(+id);
  }
}