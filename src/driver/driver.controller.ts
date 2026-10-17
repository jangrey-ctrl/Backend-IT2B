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

import { DriverService } from './driver.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('driver')
export class DriverController {
  constructor(private driverService: DriverService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.driverService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.driverService.findById(+id);
  }

  @Post()
  async create(
    @Body()
    body: {
      driver_code: string;
      driver_firstname: string;
      driver_lastname: string;
      driver_phone: string;
    },
  ) {
    return this.driverService.createDriver(
      body.driver_code,
      body.driver_firstname,
      body.driver_lastname,
      body.driver_phone,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.driverService.updateDriver(+id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.driverService.deleteDriver(+id);
  }
}