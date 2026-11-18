
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
      'SELECT bus_id, bus_code, bus_number, bus_type, bus_capacity, role FROM bus WHERE bus_code = ?',
      [bus_code],
    );

    return rows[0];
  }

  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT bus_id, bus_code, bus_number, bus_type, bus_capacity, role, created_at FROM bus WHERE bus_id = ?',
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

    if (partial.bus_code !== undefined) {
      fields.push('bus_code = ?');
      values.push(partial.bus_code);
    }

    if (partial.bus_number !== undefined) {
      fields.push('bus_number = ?');
      values.push(partial.bus_number);
    }

    if (partial.bus_type !== undefined) {
      fields.push('bus_type = ?');
      values.push(partial.bus_type);
    }

    if (partial.bus_capacity !== undefined) {
      fields.push('bus_capacity = ?');
      values.push(partial.bus_capacity);
    }

    if (partial.role !== undefined) {
      fields.push('role = ?');
      values.push(partial.role);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

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
}
