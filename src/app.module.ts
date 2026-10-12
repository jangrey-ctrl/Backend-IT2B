import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { CategoryModule } from './category/category.module';
import { BusModule } from './bus/bus.module';
import { SeatModule } from './seat/seat.module';
import { RouteModule } from './route/route.module';

@Module({
  imports: [DatabaseModule, UsersModule, AuthModule, CategoryModule, BusModule, SeatModule, RouteModule],
})
export class AppModule {}