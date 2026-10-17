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

import { PassengerService } from './passenger.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('passenger')
export class PassengerController {
  constructor(private passengerService: PassengerService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.passengerService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.passengerService.findById(+id);
  }

  @Post()
  async create(
    @Body()
    body: {
      passenger_code: number;
      passenger_firstname: string;
      passenger_lastname: string;
      passenger_phone: number;
      passenger_email: string;
    },
  ) {
    return this.passengerService.createPassenger(
      body.passenger_code,
      body.passenger_firstname,
      body.passenger_lastname,
      body.passenger_phone,
      body.passenger_email,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.passengerService.updatePassenger(+id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.passengerService.deletePassenger(+id);
  }
}