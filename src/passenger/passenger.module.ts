import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { PassengerService } from './passenger.service';
import { PassengerController } from './passenger.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [PassengerController],
  providers: [PassengerService],
  exports: [PassengerService],
})
export class PassengerModule {}