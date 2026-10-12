import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { BusService } from './bus.service';
import { BusController } from './bus.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],

  controllers: [BusController],
  providers: [BusService],
  exports: [BusService],
})

export class BusModule {}