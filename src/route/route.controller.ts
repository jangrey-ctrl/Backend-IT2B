import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards,} from '@nestjs/common';
import { RouteService } from './route.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('route')
export class RouteController {
  constructor(private routeService: RouteService) {}

  // Get all routes (protected)
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.routeService.getAll();
  }

  // Get single route by id (protected)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.routeService.findById(+id);
  }

  // Create route (open - for demo)
  @Post()
  async create(
    @Body()
    body: {
      route_code: string;
      route_origin: string;
      route_destination: string;
      role?: string;
    },
  ) {
    return this.routeService.createRoute(
      body.route_code,
      body.route_origin,
      body.route_destination,
      body.role,
    );
  }

  // Update route (protected)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.routeService.updateRoute(+id, body);
  }

  // Delete route (protected)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.routeService.deleteRoute(+id);
  }
}