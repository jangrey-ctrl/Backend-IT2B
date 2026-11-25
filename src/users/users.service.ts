
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {}

  private pool() {
    return this.db.getPool();
  }

  // CREATE USER AND PASSENGER
  async createUser(
    username: string,
    password: string,
    firstname: string,
    lastname: string,
    email: string,
  ) {
    const hashed = await bcrypt.hash(password, 10);
    const connection = await this.pool().getConnection();

    try {
      await connection.beginTransaction();

      const [userResult] = await connection.execute<OkPacket>(
        "INSERT INTO users (username, password, role) VALUES (?, ?, 'user')",
        [username, hashed],
      );

      const userId = userResult.insertId;

      await connection.execute<OkPacket>(
        `INSERT INTO passenger
        (user_id, passenger_firstname, passenger_lastname, passenger_email)
        VALUES (?, ?, ?, ?)`,
        [userId, firstname, lastname, email],
      );

      await connection.commit();

      return {
        id: userId,
        username,
        role: 'user',
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // FIND USER BY USERNAME
  async findByUsername(username: string) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT id, username, password, role, refresh_token FROM users WHERE username = ?',
      [username],
    );

    return rows[0];
  }

  // FIND USER BY ID
  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT id, username, role, refresh_token FROM users WHERE id = ?',
      [id],
    );

    return rows[0];
  }

  // GET ALL USERS
  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT id, username, role, created_at FROM users',
    );

    return rows;
  }

  // UPDATE USER
  async updateUser(
    id: number,
    partial: { username?: string; password?: string; role?: string },
  ) {
    const fields: string[] = [];
    const values: any[] = [];

    if (partial.username) {
      fields.push('username = ?');
      values.push(partial.username);
    }

    if (partial.password) {
      const hashed = await bcrypt.hash(partial.password, 10);
      fields.push('password = ?');
      values.push(hashed);
    }

    if (partial.role) {
      fields.push('role = ?');
      values.push(partial.role);
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    values.push(id);

    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;

    await this.pool().execute(sql, values);

    return this.findById(id);
  }

  // DELETE USER
  async deleteUser(id: number) {
    await this.pool().execute<OkPacket>(
      'DELETE FROM users WHERE id = ?',
      [id],
    );

    return true;
  }

  // SET REFRESH TOKEN
  async setRefreshToken(id: number, refreshToken: string | null) {
    await this.pool().execute(
      'UPDATE users SET refresh_token = ? WHERE id = ?',
      [refreshToken, id],
    );
  }

  // FIND USER BY REFRESH TOKEN
  async findByRefreshToken(refreshToken: string) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT id, username, role FROM users WHERE refresh_token = ?',
      [refreshToken],
    );

    return rows[0];
  }
}
