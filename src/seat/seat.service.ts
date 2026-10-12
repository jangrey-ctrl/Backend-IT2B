import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';

@Injectable()
export class SeatService {
  constructor(private db: DatabaseService) {}

  private pool() {
    return this.db.getPool();
  }

  async createSeat(
    seat_code: string,
    bus_id: number,
    seat_number: string,
    seat_status: string,
    role = 'seat',
  ) {
    const [result] = await this.pool().execute<OkPacket>(
      `INSERT INTO seat
      (seat_code, bus_id, seat_number, seat_status, role)
      VALUES (?, ?, ?, ?, ?)`,
      [seat_code, bus_id, seat_number, seat_status, role],
    );

    return {
      seat_id: result.insertId,
      seat_code,
      bus_id,
      seat_number,
      seat_status,
      role,
    };
  }

  async findBySeatCode(seat_code: string) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT seat_id, seat_code, bus_id, seat_number,
      seat_status, role, refresh_token
      FROM seat
      WHERE seat_code = ?`,
      [seat_code],
    );

    return rows[0];
  }

  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT seat_id, seat_code, bus_id,
      seat_number, seat_status, role,
      refresh_token
      FROM seat
      WHERE seat_id = ?`,
      [id],
    );

    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT seat_id, seat_code, bus_id,
      seat_number, seat_status, role,
      created_at
      FROM seat`,
    );

    return rows;
  }

  async updateSeat(
    id: number,
    partial: {
      seat_code?: string;
      bus_id?: number;
      seat_number?: string;
      seat_status?: string;
      role?: string;
    },
  ) {
    const fields: string[] = [];
    const values: any[] = [];

    if (partial.seat_code) {
      fields.push('seat_code = ?');
      values.push(partial.seat_code);
    }

    if (partial.bus_id !== undefined) {
      fields.push('bus_id = ?');
      values.push(partial.bus_id);
    }

    if (partial.seat_number) {
      fields.push('seat_number = ?');
      values.push(partial.seat_number);
    }

    if (partial.seat_status) {
      fields.push('seat_status = ?');
      values.push(partial.seat_status);
    }

    if (partial.role) {
      fields.push('role = ?');
      values.push(partial.role);
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    values.push(id);

    const sql = `UPDATE seat SET ${fields.join(', ')} WHERE seat_id = ?`;

    await this.pool().execute(sql, values);

    return this.findById(id);
  }

  async deleteSeat(id: number) {
    const [result] = await this.pool().execute<OkPacket>(
      'DELETE FROM seat WHERE seat_id = ?',
      [id],
    );

    return true;
  }

  async setRefreshToken(id: number, refreshToken: string | null) {
    await this.pool().execute(
      'UPDATE seat SET refresh_token = ? WHERE seat_id = ?',
      [refreshToken, id],
    );
  }

  async findByRefreshToken(refreshToken: string) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT seat_id, seat_code, role FROM seat WHERE refresh_token = ?',
      [refreshToken],
    );

    return rows[0];
  }
}