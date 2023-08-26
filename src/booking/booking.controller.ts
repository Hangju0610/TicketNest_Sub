import { Redis } from 'ioredis';
import { Controller, Inject, OnModuleInit } from '@nestjs/common';
import { BookingService } from './booking.service';
import { OnQueueEvent, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('Ticket')
export class BookingProcessor {
  constructor(private readonly bookingService: BookingService) {}

  @Process('createBooking')
  async createBooking(job: Job<unknown>) {
    const bookingData = job.data;
    const createBooking = await this.bookingService.createBooking(bookingData);
  }
}
