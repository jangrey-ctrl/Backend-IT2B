import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';

import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.paymentService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.paymentService.findById(+id);
  }

  @Post()
  async create(
    @Body()
    body: {
      payment_code: string;
      booking_id: number;
      payment_method: string;
      payment_amount: number;
      payment_status: string;
      payment_date: string;
    },
  ) {
    return this.paymentService.createPayment(
      body.payment_code,
      body.booking_id,
      body.payment_method,
      body.payment_amount,
      body.payment_status,
      body.payment_date,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.paymentService.updatePayment(+id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.paymentService.deletePayment(+id);
  }
}