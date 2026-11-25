
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
      [sched_code, bus_id, route_id, driver_id, departure_time, arrival_time, fare],
    );

    return this.findById(result.insertId);
  }

  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT
        s.sched_id,
        s.sched_code,
        s.bus_id,
        s.route_id,
        s.driver_id,
        s.departure_time,
        s.arrival_time,
        s.fare,
        s.created_at,
        b.bus_number,
        b.bus_type,
        r.route_origin,
        r.route_destination,
        CONCAT(d.driver_firstname, ' ', d.driver_lastname) AS driver_name
      FROM sched s
      LEFT JOIN bus b ON s.bus_id = b.bus_id
      LEFT JOIN route r ON s.route_id = r.route_id
      LEFT JOIN driver d ON s.driver_id = d.driver_id
      WHERE s.sched_id = ?`,
      [id],
    );

    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT
        s.sched_id,
        s.sched_code,
        s.bus_id,
        s.route_id,
        s.driver_id,
        s.departure_time,
        s.arrival_time,
        s.fare,
        s.created_at,
        b.bus_number,
        b.bus_type,
        r.route_origin,
        r.route_destination,
        CONCAT(d.driver_firstname, ' ', d.driver_lastname) AS driver_name
      FROM sched s
      LEFT JOIN bus b ON s.bus_id = b.bus_id
      LEFT JOIN route r ON s.route_id = r.route_id
      LEFT JOIN driver d ON s.driver_id = d.driver_id
      ORDER BY s.departure_time ASC`,
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

    if (partial.sched_code !== undefined) {
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

    if (partial.departure_time !== undefined) {
      fields.push('departure_time = ?');
      values.push(partial.departure_time);
    }

    if (partial.arrival_time !== undefined) {
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

    await this.pool().execute(
      `UPDATE sched SET ${fields.join(', ')} WHERE sched_id = ?`,
      values,
    );

    return this.findById(id);
  }

  async deleteSched(id: number) {
    await this.pool().execute<OkPacket>(
      'DELETE FROM sched WHERE sched_id = ?',
      [id],
    );

    return { message: 'Schedule deleted successfully' };
  }
}
