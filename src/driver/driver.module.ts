import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { DriverService } from './driver.service';
import { DriverController } from './driver.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [DriverController],
  providers: [DriverService],
  exports: [DriverService],
})
export class DriverModule {}