
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

import { DriverService } from './driver.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('driver')
@UseGuards(JwtAuthGuard)
export class DriverController {
  constructor(private driverService: DriverService) {}

  private checkAdmin(request: any) {
    if (request.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
  }

  @Get()
  async getAll() {
    return this.driverService.getAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.driverService.findById(+id);
  }

  @Post()
  async create(
    @Body() body: {
      driver_code: string;
      driver_firstname: string;
      driver_lastname: string;
      driver_phone: string;
    },
    @Request() request: any,
  ) {
    this.checkAdmin(request);

    return this.driverService.createDriver(
      body.driver_code,
      body.driver_firstname,
      body.driver_lastname,
      body.driver_phone,
    );
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @Request() request: any,
  ) {
    this.checkAdmin(request);
    return this.driverService.updateDriver(+id, body);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Request() request: any,
  ) {
    this.checkAdmin(request);
    return this.driverService.deleteDriver(+id);
  }
}
