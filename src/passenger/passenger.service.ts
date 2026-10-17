import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';

@Injectable()
export class PassengerService {
  constructor(private db: DatabaseService) {}

  private pool() {
    return this.db.getPool();
  }

  async createPassenger(
    passenger_code: number,
    passenger_firstname: string,
    passenger_lastname: string,
    passenger_phone: number,
    passenger_email: string,
  ) {
    const [result] = await this.pool().execute<OkPacket>(
      `INSERT INTO passenger
      (passenger_code, passenger_firstname, passenger_lastname,
      passenger_phone, passenger_email)
      VALUES (?, ?, ?, ?, ?)`,
      [
        passenger_code,
        passenger_firstname,
        passenger_lastname,
        passenger_phone,
        passenger_email,
      ],
    );

    return {
      passenger_id: result.insertId,
      passenger_code,
      passenger_firstname,
      passenger_lastname,
      passenger_phone,
      passenger_email,
    };
  }

  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT passenger_id, passenger_code, passenger_firstname,
      passenger_lastname, passenger_phone, passenger_email
      FROM passenger
      WHERE passenger_id = ?`,
      [id],
    );

    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT passenger_id, passenger_code, passenger_firstname,
      passenger_lastname, passenger_phone, passenger_email,
      created_at
      FROM passenger`,
    );

    return rows;
  }

  async updatePassenger(
    id: number,
    partial: {
      passenger_code?: number;
      passenger_firstname?: string;
      passenger_lastname?: string;
      passenger_phone?: number;
      passenger_email?: string;
    },
  ) {
    const fields: string[] = [];
    const values: any[] = [];

    if (partial.passenger_code !== undefined) {
      fields.push('passenger_code = ?');
      values.push(partial.passenger_code);
    }

    if (partial.passenger_firstname) {
      fields.push('passenger_firstname = ?');
      values.push(partial.passenger_firstname);
    }

    if (partial.passenger_lastname) {
      fields.push('passenger_lastname = ?');
      values.push(partial.passenger_lastname);
    }

    if (partial.passenger_phone !== undefined) {
      fields.push('passenger_phone = ?');
      values.push(partial.passenger_phone);
    }

    if (partial.passenger_email) {
      fields.push('passenger_email = ?');
      values.push(partial.passenger_email);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const sql = `
      UPDATE passenger
      SET ${fields.join(', ')}
      WHERE passenger_id = ?
    `;

    await this.pool().execute(sql, values);

    return this.findById(id);
  }

  async deletePassenger(id: number) {
    const [result] = await this.pool().execute<OkPacket>(
      'DELETE FROM passenger WHERE passenger_id = ?',
      [id],
    );

    return result.affectedRows > 0;
  }
}