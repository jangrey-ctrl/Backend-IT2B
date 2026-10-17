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

import { SchedService } from './sched.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('sched')
export class SchedController {
  constructor(private schedService: SchedService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.schedService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.schedService.findById(+id);
  }

  @Post()
  async create(
    @Body()
    body: {
      sched_code: string;
      bus_id: number;
      route_id: number;
      driver_id: number;
      departure_time: string;
      arrival_time: string;
      fare: number;
    },
  ) {
    return this.schedService.createSched(
      body.sched_code,
      body.bus_id,
      body.route_id,
      body.driver_id,
      body.departure_time,
      body.arrival_time,
      body.fare,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.schedService.updateSched(+id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.schedService.deleteSched(+id);
  }
}