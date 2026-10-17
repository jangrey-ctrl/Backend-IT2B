import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SchedService } from './sched.service';
import { SchedController } from './sched.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [SchedController],
  providers: [SchedService],
  exports: [SchedService],
})
export class SchedModule {}