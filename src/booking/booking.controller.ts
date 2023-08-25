import { Redis } from 'ioredis';
import { Controller, Inject, OnModuleInit } from '@nestjs/common';
import { BookingService } from './booking.service';

@Controller('booking')
export class BookingController implements OnModuleInit {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly bookingService: BookingService,
  ) {}

  onModuleInit() {
    this.redis.subscribe('Ticket');
    this.redis.on('message', async (channel, message) => {
      const booking = JSON.parse(message);
      console.log(booking);
      const createBooking = await this.bookingService.createBooking(booking);
    });
  }
}
