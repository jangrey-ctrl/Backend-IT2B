import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';

@Injectable()
export class PaymentService {
  constructor(private db: DatabaseService) {}

  private pool() {
    return this.db.getPool();
  }

  async createPayment(
    payment_code: string,
    booking_id: number,
    payment_method: string,
    payment_amount: number,
    payment_status: string,
    payment_date: string,
  ) {
    const [result] = await this.pool().execute<OkPacket>(
      `INSERT INTO payment
      (payment_code, booking_id, payment_method, payment_amount,
      payment_status, payment_date)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        payment_code,
        booking_id,
        payment_method,
        payment_amount,
        payment_status,
        payment_date,
      ],
    );

    return {
      payment_id: result.insertId,
      payment_code,
      booking_id,
      payment_method,
      payment_amount,
      payment_status,
      payment_date,
    };
  }

  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT payment_id, payment_code, booking_id,
      payment_method, payment_amount, payment_status,
      payment_date
      FROM payment
      WHERE payment_id = ?`,
      [id],
    );

    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT payment_id, payment_code, booking_id,
      payment_method, payment_amount, payment_status,
      payment_date, created_at
      FROM payment`,
    );

    return rows;
  }

  async updatePayment(
    id: number,
    partial: {
      payment_code?: string;
      booking_id?: number;
      payment_method?: string;
      payment_amount?: number;
      payment_status?: string;
      payment_date?: string;
    },
  ) {
    const fields: string[] = [];
    const values: any[] = [];

    if (partial.payment_code) {
      fields.push('payment_code = ?');
      values.push(partial.payment_code);
    }

    if (partial.booking_id !== undefined) {
      fields.push('booking_id = ?');
      values.push(partial.booking_id);
    }

    if (partial.payment_method) {
      fields.push('payment_method = ?');
      values.push(partial.payment_method);
    }

    if (partial.payment_amount !== undefined) {
      fields.push('payment_amount = ?');
      values.push(partial.payment_amount);
    }

    if (partial.payment_status) {
      fields.push('payment_status = ?');
      values.push(partial.payment_status);
    }

    if (partial.payment_date) {
      fields.push('payment_date = ?');
      values.push(partial.payment_date);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const sql = `
      UPDATE payment
      SET ${fields.join(', ')}
      WHERE payment_id = ?
    `;

    await this.pool().execute(sql, values);

    return this.findById(id);
  }

  async deletePayment(id: number) {
    const [result] = await this.pool().execute<OkPacket>(
      'DELETE FROM payment WHERE payment_id = ?',
      [id],
    );

    return true;
  }
}