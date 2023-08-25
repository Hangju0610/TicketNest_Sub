import { Redis } from 'ioredis';
import { Controller, Inject, OnModuleInit } from '@nestjs/common';
import { BookingService } from './booking.service';

@Controller('booking')
export class BookingController implements OnModuleInit {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly bookingService: BookingService,
  ) {}
}
