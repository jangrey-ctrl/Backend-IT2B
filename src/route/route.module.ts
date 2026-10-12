import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { RouteService } from './route.service';
import { RouteController } from './route.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],

  controllers: [RouteController],
  providers: [RouteService],
  exports: [RouteService],
})
export class RouteModule {}