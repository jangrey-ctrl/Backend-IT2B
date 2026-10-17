import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';

@Injectable()
export class BookingService {
  constructor(private db: DatabaseService) {}

  private pool() {
    return this.db.getPool();
  }

  async createBooking(
    booking_code: string,
    passenger_id: number,
    sched_id: number,
    seat_id: number,
    booking_date: string,
    booking_status: string,
  ) {
    const [result] = await this.pool().execute<OkPacket>(
      `INSERT INTO booking
      (booking_code, passenger_id, sched_id, seat_id, booking_date, booking_status)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        booking_code,
        passenger_id,
        sched_id,
        seat_id,
        booking_date,
        booking_status,
      ],
    );

    return {
      booking_id: result.insertId,
      booking_code,
      passenger_id,
      sched_id,
      seat_id,
      booking_date,
      booking_status,
    };
  }

  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT booking_id, booking_code, passenger_id,
      sched_id, seat_id, booking_date, booking_status
      FROM booking
      WHERE booking_id = ?`,
      [id],
    );

    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT booking_id, booking_code, passenger_id,
      sched_id, seat_id, booking_date, booking_status,
      created_at
      FROM booking`,
    );

    return rows;
  }

  async updateBooking(
    id: number,
    partial: {
      booking_code?: string;
      passenger_id?: number;
      sched_id?: number;
      seat_id?: number;
      booking_date?: string;
      booking_status?: string;
    },
  ) {
    const fields: string[] = [];
    const values: any[] = [];

    if (partial.booking_code) {
      fields.push('booking_code = ?');
      values.push(partial.booking_code);
    }

    if (partial.passenger_id !== undefined) {
      fields.push('passenger_id = ?');
      values.push(partial.passenger_id);
    }

    if (partial.sched_id !== undefined) {
      fields.push('sched_id = ?');
      values.push(partial.sched_id);
    }

    if (partial.seat_id !== undefined) {
      fields.push('seat_id = ?');
      values.push(partial.seat_id);
    }

    if (partial.booking_date) {
      fields.push('booking_date = ?');
      values.push(partial.booking_date);
    }

    if (partial.booking_status) {
      fields.push('booking_status = ?');
      values.push(partial.booking_status);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const sql = `
      UPDATE booking
      SET ${fields.join(', ')}
      WHERE booking_id = ?
    `;

    await this.pool().execute(sql, values);

    return this.findById(id);
  }

  async deleteBooking(id: number) {
    const [result] = await this.pool().execute<OkPacket>(
      'DELETE FROM booking WHERE booking_id = ?',
      [id],
    );

    return true;
  }
}