import {Controller, Get, Post, Put, Delete, Body, Param, UseGuards} from '@nestjs/common';
import { BusService } from './bus.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('bus')
export class BusController {
  constructor(private busService: BusService) {}

  // Get all buses (protected)
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.busService.getAll();
  }

  // Get single bus by id (protected)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.busService.findById(+id);
  }

  // Create bus (open - for demo)
  @Post()
  async create(
    @Body()
    body: {
      bus_code: string;
      bus_number: string;
      bus_type: string;
      bus_capacity: number;
      role?: string;
    },
  ) {
    return this.busService.createBus(
      body.bus_code,
      body.bus_number,
      body.bus_type,
      body.bus_capacity,
      body.role,
    );
  }

  // Update bus (protected)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.busService.updateBus(+id, body);
  }

  // Delete bus (protected)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.busService.deleteBus(+id);
  }
}