import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { BusModule } from './bus/bus.module';
import { SeatModule } from './seat/seat.module';
import { RouteModule } from './route/route.module';
import { PassengerModule } from './passenger/passenger.module';
import { DriverModule } from './driver/driver.module';
import { SchedModule } from './sched/sched.module';
import { BookingModule } from './booking/booking.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [DatabaseModule, UsersModule, AuthModule, BusModule, SeatModule, RouteModule, PassengerModule, DriverModule, SchedModule, BookingModule, PaymentModule],
})
export class AppModule {}