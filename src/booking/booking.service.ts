import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';
import { randomBytes } from 'crypto';

@Injectable()
export class BookingService {
  constructor(private db: DatabaseService) {}

  private pool() {
    return this.db.getPool();
  }

  async getAvailableSeats(schedId: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT s.seat_id, s.seat_code, s.seat_number, s.seat_status
       FROM seat s
       INNER JOIN sched sc ON sc.bus_id = s.bus_id
       WHERE sc.sched_id = ?
       AND LOWER(s.seat_status) = 'available'
       AND NOT EXISTS (
         SELECT 1 FROM booking b
         WHERE b.sched_id = sc.sched_id
         AND b.seat_id = s.seat_id
         AND LOWER(b.booking_status) <> 'cancelled'
       )
       ORDER BY s.seat_number`,
      [schedId],
    );

    return rows;
  }

  async createBooking(userId: number, schedId: number, seatId: number) {
    const connection = await this.pool().getConnection();

    try {
      await connection.beginTransaction();

      const [passengers] = await connection.execute<RowDataPacket[]>(
        'SELECT passenger_id FROM passenger WHERE user_id = ? FOR UPDATE',
        [userId],
      );

      if (!passengers.length) {
        throw new NotFoundException('Passenger profile not found.');
      }

      const passengerId = passengers[0].passenger_id;

      const [schedules] = await connection.execute<RowDataPacket[]>(
        'SELECT sched_id, bus_id, departure_time FROM sched WHERE sched_id = ?',
        [schedId],
      );

      if (!schedules.length) {
        throw new NotFoundException('Schedule not found.');
      }

      if (new Date(schedules[0].departure_time).getTime() <= Date.now()) {
        throw new BadRequestException('This schedule is no longer available.');
      }

      const [seats] = await connection.execute<RowDataPacket[]>(
        `SELECT seat_id, seat_number, seat_status
         FROM seat
         WHERE seat_id = ? AND bus_id = ?
         FOR UPDATE`,
        [seatId, schedules[0].bus_id],
      );

      if (!seats.length) {
        throw new BadRequestException('Invalid seat for this schedule.');
      }

      if (String(seats[0].seat_status).toLowerCase() !== 'available') {
        throw new BadRequestException('This seat is not available.');
      }

      const [existing] = await connection.execute<RowDataPacket[]>(
        `SELECT booking_id FROM booking
         WHERE sched_id = ? AND seat_id = ?
         AND LOWER(booking_status) <> 'cancelled'
         FOR UPDATE`,
        [schedId, seatId],
      );

      if (existing.length) {
        throw new BadRequestException('This seat has already been booked.');
      }

      const bookingCode = `BK-${Date.now()}-${randomBytes(3).toString('hex').toUpperCase()}`;

      const [result] = await connection.execute<OkPacket>(
        `INSERT INTO booking
         (booking_code, passenger_id, sched_id, seat_id, booking_date, booking_status)
         VALUES (?, ?, ?, ?, CURDATE(), 'confirmed')`,
        [bookingCode, passengerId, schedId, seatId],
      );

      await connection.commit();

      return {
        booking_id: result.insertId,
        booking_code: bookingCode,
        passenger_id: passengerId,
        sched_id: schedId,
        seat_id: seatId,
        booking_status: 'confirmed',
        message: 'Booking successful.',
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getAll(userId: number, role: string) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT b.booking_id, b.booking_code, b.passenger_id,
       b.sched_id, b.seat_id, b.booking_date, b.booking_status,
       p.passenger_firstname, p.passenger_lastname, p.passenger_email,
       s.seat_number, sc.departure_time, sc.arrival_time, sc.fare,
       r.route_origin, r.route_destination, bus.bus_number
       FROM booking b
       INNER JOIN passenger p ON p.passenger_id = b.passenger_id
       INNER JOIN sched sc ON sc.sched_id = b.sched_id
       INNER JOIN seat s ON s.seat_id = b.seat_id
       INNER JOIN route r ON r.route_id = sc.route_id
       INNER JOIN bus ON bus.bus_id = sc.bus_id
       ${role === 'admin' ? '' : 'WHERE p.user_id = ?'}
       ORDER BY b.created_at DESC`,
      role === 'admin' ? [] : [userId],
    );

    return rows;
  }

  async findById(id: number, userId: number, role: string) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT b.*, p.user_id
       FROM booking b
       INNER JOIN passenger p ON p.passenger_id = b.passenger_id
       WHERE b.booking_id = ?
       ${role === 'admin' ? '' : 'AND p.user_id = ?'}`,
      role === 'admin' ? [id] : [id, userId],
    );

    if (!rows.length) {
      throw new NotFoundException('Booking not found.');
    }

    return rows[0];
  }

  async cancelBooking(id: number, userId: number, role: string) {
    const booking = await this.findById(id, userId, role);

    if (String(booking.booking_status).toLowerCase() === 'cancelled') {
      throw new BadRequestException('Booking is already cancelled.');
    }

    await this.pool().execute(
      `UPDATE booking SET booking_status = 'cancelled' WHERE booking_id = ?`,
      [id],
    );

    return { message: 'Booking cancelled successfully.' };
  }

  async updateBooking(id: number, partial: any) {
    const allowedStatuses = ['confirmed', 'pending', 'cancelled'];

    if (partial.booking_status && !allowedStatuses.includes(String(partial.booking_status).toLowerCase())) {
      throw new BadRequestException('Invalid booking status.');
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (partial.booking_status !== undefined) {
      fields.push('booking_status = ?');
      values.push(partial.booking_status);
    }

    if (!fields.length) {
      return this.findById(id, 0, 'admin');
    }

    values.push(id);

    await this.pool().execute(
      `UPDATE booking SET ${fields.join(', ')} WHERE booking_id = ?`,
      values,
    );

    return this.findById(id, 0, 'admin');
  }

  async deleteBooking(id: number) {
    await this.pool().execute('DELETE FROM booking WHERE booking_id = ?', [id]);
    return { message: 'Booking deleted successfully.' };
  }
}