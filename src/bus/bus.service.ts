
import { Injectable, BadRequestException } from '@nestjs/common';
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
    if (!Number.isInteger(bus_capacity) || bus_capacity < 1) {
      throw new BadRequestException('Bus capacity must be at least 1.');
    }

    const connection = await this.pool().getConnection();

    try {
      await connection.beginTransaction();

      const [result] = await connection.execute<OkPacket>(
        'INSERT INTO bus (bus_code, bus_number, bus_type, bus_capacity, role) VALUES (?, ?, ?, ?, ?)',
        [bus_code, bus_number, bus_type, bus_capacity, role],
      );

      const busId = result.insertId;

      for (let i = 1; i <= bus_capacity; i++) {
        const seatNumber = String(i);
        const seatCode = `BUS-${busId}-SEAT-${String(i).padStart(3, '0')}`;

        await connection.execute(
          `INSERT INTO seat (seat_code, bus_id, seat_number, seat_status, role)
           VALUES (?, ?, ?, 'Available', 'seat')`,
          [seatCode, busId, seatNumber],
        );
      }

      await connection.commit();

      return {
        bus_id: busId,
        bus_code,
        bus_number,
        bus_type,
        bus_capacity,
        role,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
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
    if (partial.bus_capacity !== undefined &&
        (!Number.isInteger(partial.bus_capacity) || partial.bus_capacity < 1)) {
      throw new BadRequestException('Bus capacity must be at least 1.');
    }

    const connection = await this.pool().getConnection();

    try {
      await connection.beginTransaction();

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

      if (fields.length > 0) {
        values.push(id);
        await connection.execute(
          `UPDATE bus SET ${fields.join(', ')} WHERE bus_id = ?`,
          values,
        );
      }

      if (partial.bus_capacity !== undefined) {
        const capacity = partial.bus_capacity;

        const [bookedSeats] = await connection.execute<RowDataPacket[]>(
          `SELECT s.seat_id
           FROM seat s
           INNER JOIN booking b ON b.seat_id = s.seat_id
           WHERE s.bus_id = ?
           AND CAST(s.seat_number AS UNSIGNED) > ?
           LIMIT 1`,
          [id, capacity],
        );

        if (bookedSeats.length > 0) {
          throw new BadRequestException(
            'Cannot reduce capacity because some seats have existing bookings.',
          );
        }

        await connection.execute(
          `DELETE FROM seat
           WHERE bus_id = ?
           AND CAST(seat_number AS UNSIGNED) > ?`,
          [id, capacity],
        );

        const [existingSeats] = await connection.execute<RowDataPacket[]>(
          'SELECT seat_number FROM seat WHERE bus_id = ?',
          [id],
        );

        const existingNumbers = new Set(
          existingSeats.map((seat) => String(seat.seat_number)),
        );

        for (let i = 1; i <= capacity; i++) {
          if (!existingNumbers.has(String(i))) {
            const seatCode = `BUS-${id}-SEAT-${String(i).padStart(3, '0')}`;

            await connection.execute(
              `INSERT INTO seat (seat_code, bus_id, seat_number, seat_status, role)
               VALUES (?, ?, ?, 'Available', 'seat')`,
              [seatCode, id, String(i)],
            );
          }
        }
      }

      await connection.commit();

      return this.findById(id);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async deleteBus(id: number) {
    await this.pool().execute<OkPacket>(
      'DELETE FROM bus WHERE bus_id = ?',
      [id],
    );

    return true;
  }
}
