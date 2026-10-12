import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SeatService } from './seat.service';
import { SeatController } from './seat.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule, PassportModule.register({ defaultStrategy: 'jwt' }),
  ],

  controllers: [SeatController],
  providers: [SeatService],
  exports: [SeatService],
})
export class SeatModule {}