
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
      (passenger_code, passenger_firstname, passenger_lastname, passenger_phone, passenger_email)
      VALUES (?, ?, ?, ?, ?)`,
      [passenger_code, passenger_firstname, passenger_lastname, passenger_phone, passenger_email],
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
      `SELECT passenger_id, passenger_code, passenger_firstname, passenger_lastname, passenger_phone, passenger_email
       FROM passenger WHERE passenger_id = ?`,
      [id],
    );

    return rows[0];
  }

  async getMyProfile(userId: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT passenger_id, passenger_code, passenger_firstname, passenger_lastname,
       passenger_phone, passenger_email, created_at
       FROM passenger WHERE user_id = ? LIMIT 1`,
      [userId],
    );

    if (rows.length === 0) {
      throw new NotFoundException('Passenger profile not found for this account.');
    }

    return rows[0];
  }

  async updateMyProfile(
    userId: number,
    partial: {
      passenger_firstname?: string;
      passenger_lastname?: string;
      passenger_phone?: string;
      passenger_email?: string;
    },
  ) {
    const fields: string[] = [];
    const values: any[] = [];

    if (partial.passenger_firstname !== undefined) {
      const firstname = partial.passenger_firstname.trim();
      if (!firstname) throw new BadRequestException('First name is required.');
      fields.push('passenger_firstname = ?');
      values.push(firstname);
    }

    if (partial.passenger_lastname !== undefined) {
      const lastname = partial.passenger_lastname.trim();
      if (!lastname) throw new BadRequestException('Last name is required.');
      fields.push('passenger_lastname = ?');
      values.push(lastname);
    }

    if (partial.passenger_email !== undefined) {
      const email = partial.passenger_email.trim();
      if (!email || !email.includes('@')) {
        throw new BadRequestException('Please enter a valid email address.');
      }
      fields.push('passenger_email = ?');
      values.push(email);
    }

    if (partial.passenger_phone !== undefined) {
      fields.push('passenger_phone = ?');
      values.push(partial.passenger_phone.trim() || null);
    }

    if (fields.length === 0) {
      return this.getMyProfile(userId);
    }

    values.push(userId);

    const [result] = await this.pool().execute<OkPacket>(
      `UPDATE passenger SET ${fields.join(', ')} WHERE user_id = ?`,
      values,
    );

    if (result.affectedRows === 0) {
      const profile = await this.getMyProfile(userId);
      return profile;
    }

    return this.getMyProfile(userId);
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT passenger_id, passenger_code, passenger_firstname, passenger_lastname,
       passenger_phone, passenger_email, created_at FROM passenger`,
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

    await this.pool().execute(
      `UPDATE passenger SET ${fields.join(', ')} WHERE passenger_id = ?`,
      values,
    );

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
