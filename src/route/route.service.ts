import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';

@Injectable()
export class RouteService {
  constructor(private db: DatabaseService) {}

  private pool() {
    return this.db.getPool();
  }

  async createRoute(
    route_code: string,
    route_origin: string,
    route_destination: string,
    role = 'route',
  ) {
    const [result] = await this.pool().execute<OkPacket>(
      `INSERT INTO route
      (route_code, route_origin, route_destination, role)
      VALUES (?, ?, ?, ?)`,
      [route_code, route_origin, route_destination, role],
    );

    return {
      route_id: result.insertId,
      route_code,
      route_origin,
      route_destination,
      role,
    };
  }

  async findByRouteCode(route_code: string) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT route_id, route_code, route_origin,
      route_destination, role, refresh_token
      FROM route
      WHERE route_code = ?`,
      [route_code],
    );

    return rows[0];
  }

  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT route_id, route_code, route_origin,
      route_destination, role, refresh_token
      FROM route
      WHERE route_id = ?`,
      [id],
    );

    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT route_id, route_code, route_origin,
      route_destination, role, created_at
      FROM route`,
    );

    return rows;
  }

  async updateRoute(
    id: number,
    partial: {
      route_code?: string;
      route_origin?: string;
      route_destination?: string;
      role?: string;
    },
  ) {
    const fields: string[] = [];
    const values: any[] = [];

    if (partial.route_code) {
      fields.push('route_code = ?');
      values.push(partial.route_code);
    }

    if (partial.route_origin) {
      fields.push('route_origin = ?');
      values.push(partial.route_origin);
    }

    if (partial.route_destination) {
      fields.push('route_destination = ?');
      values.push(partial.route_destination);
    }

    if (partial.role) {
      fields.push('role = ?');
      values.push(partial.role);
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    values.push(id);

    const sql = `UPDATE route SET ${fields.join(', ')} WHERE route_id = ?`;

    await this.pool().execute(sql, values);

    return this.findById(id);
  }

  async deleteRoute(id: number) {
    const [result] = await this.pool().execute<OkPacket>(
      'DELETE FROM route WHERE route_id = ?',
      [id],
    );

    return true;
  }

  async setRefreshToken(id: number, refreshToken: string | null) {
    await this.pool().execute(
      'UPDATE route SET refresh_token = ? WHERE route_id = ?',
      [refreshToken, id],
    );
  }

  async findByRefreshToken(refreshToken: string) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT route_id, route_code, role FROM route WHERE refresh_token = ?',
      [refreshToken],
    );

    return rows[0];
  }
}