import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';

@Injectable()
export class BusService {
  constructor(private db: DatabaseService) {}

  private pool() {
    return this.db.getPool();
  }

  async createBus(
    bus_code: string,
    bus_number: string,
    bus_type: string,
    bus_capacity: number,
    role = 'bus',
  ) {
    const [result] = await this.pool().execute<OkPacket>(
      'INSERT INTO bus (bus_code, bus_number, bus_type, bus_capacity, role) VALUES (?, ?, ?, ?, ?)',
      [bus_code, bus_number, bus_type, bus_capacity, role],
    );

    return {
      bus_id: result.insertId,
      bus_code,
      bus_number,
      bus_type,
      bus_capacity,
      role,
    };
  }

  async findByBusCode(bus_code: string) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT bus_id, bus_code, bus_number, bus_type, bus_capacity, role, refresh_token FROM bus WHERE bus_code = ?',
      [bus_code],
    );

    return rows[0];
  }

  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT bus_id, bus_code, bus_number, bus_type, bus_capacity, role, refresh_token FROM bus WHERE bus_id = ?',
      [id],
    );

    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT bus_id, bus_code, bus_number, bus_type, bus_capacity, role, created_at FROM bus',
    );

    return rows;
  }

  async updateBus(
    id: number,
    partial: {
      bus_code?: string;
      bus_number?: string;
      bus_type?: string;
      bus_capacity?: number;
      role?: string;
    },
  ) {
    const fields: string[] = [];
    const values: any[] = [];

    if (partial.bus_code) {
      fields.push('bus_code = ?');
      values.push(partial.bus_code);
    }

    if (partial.bus_number) {
      fields.push('bus_number = ?');
      values.push(partial.bus_number);
    }

    if (partial.bus_type) {
      fields.push('bus_type = ?');
      values.push(partial.bus_type);
    }

    if (partial.bus_capacity !== undefined) {
      fields.push('bus_capacity = ?');
      values.push(partial.bus_capacity);
    }

    if (partial.role) {
      fields.push('role = ?');
      values.push(partial.role);
    }

    if (fields.length === 0) return await this.findById(id);

    values.push(id);

    const sql = `UPDATE bus SET ${fields.join(', ')} WHERE bus_id = ?`;

    await this.pool().execute(sql, values);

    return this.findById(id);
  }

  async deleteBus(id: number) {
  await this.pool().execute<OkPacket>(
    'DELETE FROM bus WHERE bus_id = ?',
    [id],
  );

  return true;
}
  async setRefreshToken(id: number, refreshToken: string | null) {
    await this.pool().execute(
      'UPDATE bus SET refresh_token = ? WHERE bus_id = ?',
      [refreshToken, id],
    );
  }

  async findByRefreshToken(refreshToken: string) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT bus_id, bus_code, role FROM bus WHERE refresh_token = ?',
      [refreshToken],
    );

    return rows[0];
  }
}