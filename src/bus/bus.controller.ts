
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
import { BusService } from './bus.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('bus')
@UseGuards(JwtAuthGuard)
export class BusController {
  constructor(private busService: BusService) {}

  private checkAdmin(request: any) {
    if (request.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
  }

  // GET ALL BUSES
  @Get()
  async getAll() {
    return this.busService.getAll();
  }

  // GET BUS BY ID
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.busService.findById(+id);
  }

  // CREATE BUS - ADMIN ONLY
  @Post()
  async create(
    @Body()
    body: {
      bus_code: string;
      bus_number: string;
      bus_type: string;
      bus_capacity: number;
    },
    @Request() request: any,
  ) {
    this.checkAdmin(request);

    return this.busService.createBus(
      body.bus_code,
      body.bus_number,
      body.bus_type,
      body.bus_capacity,
    );
  }

  // UPDATE BUS - ADMIN ONLY
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @Request() request: any,
  ) {
    this.checkAdmin(request);
    return this.busService.updateBus(+id, body);
  }

  // DELETE BUS - ADMIN ONLY
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Request() request: any,
  ) {
    this.checkAdmin(request);
    return this.busService.deleteBus(+id);
  }
}
