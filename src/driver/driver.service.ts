import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';

@Injectable()
export class DriverService {
  constructor(private db: DatabaseService) {}

  private pool() {
    return this.db.getPool();
  }

  async createDriver(
    driver_code: string,
    driver_firstname: string,
    driver_lastname: string,
    driver_phone: string,
  ) {
    const [result] = await this.pool().execute<OkPacket>(
      `INSERT INTO driver
      (driver_code, driver_firstname, driver_lastname, driver_phone)
      VALUES (?, ?, ?, ?)`,
      [
        driver_code,
        driver_firstname,
        driver_lastname,
        driver_phone,
      ],
    );

    return {
      driver_id: result.insertId,
      driver_code,
      driver_firstname,
      driver_lastname,
      driver_phone,
    };
  }

  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT driver_id, driver_code, driver_firstname,
      driver_lastname, driver_phone
      FROM driver
      WHERE driver_id = ?`,
      [id],
    );

    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT driver_id, driver_code, driver_firstname,
      driver_lastname, driver_phone, created_at
      FROM driver`,
    );

    return rows;
  }

  async updateDriver(
    id: number,
    partial: {
      driver_code?: string;
      driver_firstname?: string;
      driver_lastname?: string;
      driver_phone?: string;
    },
  ) {
    const fields: string[] = [];
    const values: any[] = [];

    if (partial.driver_code) {
      fields.push('driver_code = ?');
      values.push(partial.driver_code);
    }

    if (partial.driver_firstname) {
      fields.push('driver_firstname = ?');
      values.push(partial.driver_firstname);
    }

    if (partial.driver_lastname) {
      fields.push('driver_lastname = ?');
      values.push(partial.driver_lastname);
    }

    if (partial.driver_phone) {
      fields.push('driver_phone = ?');
      values.push(partial.driver_phone);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const sql = `
      UPDATE driver
      SET ${fields.join(', ')}
      WHERE driver_id = ?
    `;

    await this.pool().execute(sql, values);

    return this.findById(id);
  }

  async deleteDriver(id: number) {
    const [result] = await this.pool().execute<OkPacket>(
      'DELETE FROM driver WHERE driver_id = ?',
      [id],
    );

    return true;
  }
}