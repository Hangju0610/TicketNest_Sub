import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingEntity } from 'src/database/entity/booking.entity';
import { GoodsEntity } from 'src/database/entity/goods.entity';
import { Repository } from 'typeorm';
import { BookingDto } from './dto/booking.dto';
import * as apm from 'elastic-apm-node';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(GoodsEntity)
    private goodsRepository: Repository<GoodsEntity>,
    @InjectRepository(BookingEntity)
    private bookingRepository: Repository<BookingEntity>,
  ) {}

  async createBooking(booking: BookingDto) {
    const bookingSpan = apm.startSpan('BookingSpan');
    await this.bookingRepository
      .createQueryBuilder()
      .insert()
      .into(BookingEntity)
      .values({
        goodsId: booking.goodsId,
        userId: booking.userId,
      })
      .execute();
    bookingSpan.end();

    const goodsSpan = apm.startSpan('GoodsSpan');
    await this.goodsRepository
      .createQueryBuilder()
      .update(GoodsEntity)
      .set({
        bookingCount: () => 'bookingCount + 1',
      })
      .where('id = :id', { id: booking.goodsId })
      .execute();
    goodsSpan.end();
  }
}
