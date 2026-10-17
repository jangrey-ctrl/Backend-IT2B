import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';

@Injectable()
export class SchedService {
  constructor(private db: DatabaseService) {}

  private pool() {
    return this.db.getPool();
  }

  async createSched(
    sched_code: string,
    bus_id: number,
    route_id: number,
    driver_id: number,
    departure_time: string,
    arrival_time: string,
    fare: number,
  ) {
    const [result] = await this.pool().execute<OkPacket>(
      `INSERT INTO sched
      (sched_code, bus_id, route_id, driver_id, departure_time, arrival_time, fare)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        sched_code,
        bus_id,
        route_id,
        driver_id,
        departure_time,
        arrival_time,
        fare,
      ],
    );

    return {
      sched_id: result.insertId,
      sched_code,
      bus_id,
      route_id,
      driver_id,
      departure_time,
      arrival_time,
      fare,
    };
  }

  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT sched_id, sched_code, bus_id, route_id,
      driver_id, departure_time, arrival_time, fare
      FROM sched
      WHERE sched_id = ?`,
      [id],
    );

    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT sched_id, sched_code, bus_id, route_id,
      driver_id, departure_time, arrival_time, fare, created_at
      FROM sched`,
    );

    return rows;
  }

  async updateSched(
    id: number,
    partial: {
      sched_code?: string;
      bus_id?: number;
      route_id?: number;
      driver_id?: number;
      departure_time?: string;
      arrival_time?: string;
      fare?: number;
    },
  ) {
    const fields: string[] = [];
    const values: any[] = [];

    if (partial.sched_code) {
      fields.push('sched_code = ?');
      values.push(partial.sched_code);
    }

    if (partial.bus_id !== undefined) {
      fields.push('bus_id = ?');
      values.push(partial.bus_id);
    }

    if (partial.route_id !== undefined) {
      fields.push('route_id = ?');
      values.push(partial.route_id);
    }

    if (partial.driver_id !== undefined) {
      fields.push('driver_id = ?');
      values.push(partial.driver_id);
    }

    if (partial.departure_time) {
      fields.push('departure_time = ?');
      values.push(partial.departure_time);
    }

    if (partial.arrival_time) {
      fields.push('arrival_time = ?');
      values.push(partial.arrival_time);
    }

    if (partial.fare !== undefined) {
      fields.push('fare = ?');
      values.push(partial.fare);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const sql = `
      UPDATE sched
      SET ${fields.join(', ')}
      WHERE sched_id = ?
    `;

    await this.pool().execute(sql, values);

    return this.findById(id);
  }

  async deleteSched(id: number) {
    const [result] = await this.pool().execute<OkPacket>(
      'DELETE FROM sched WHERE sched_id = ?',
      [id],
    );

    return true;
  }
}