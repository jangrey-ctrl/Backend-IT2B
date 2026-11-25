
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
import { RouteService } from './route.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('route')
@UseGuards(JwtAuthGuard)
export class RouteController {
  constructor(private routeService: RouteService) {}

  private checkAdmin(request: any) {
    if (request.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
  }

  @Get()
  async getAll() {
    return this.routeService.getAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.routeService.findById(+id);
  }

  @Post()
  async create(
    @Body() body: {
      route_code: string;
      route_origin: string;
      route_destination: string;
    },
    @Request() request: any,
  ) {
    this.checkAdmin(request);
    return this.routeService.createRoute(
      body.route_code,
      body.route_origin,
      body.route_destination,
    );
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @Request() request: any,
  ) {
    this.checkAdmin(request);
    return this.routeService.updateRoute(+id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() request: any) {
    this.checkAdmin(request);
    return this.routeService.deleteRoute(+id);
  }
}
