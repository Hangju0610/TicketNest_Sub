import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingEntity } from 'src/database/entity/booking.entity';
import { GoodsEntity } from 'src/database/entity/goods.entity';
import { Repository } from 'typeorm';
import { BookingDto } from './dto/booking.dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(GoodsEntity)
    private goodsRepository: Repository<GoodsEntity>,
    @InjectRepository(BookingEntity)
    private bookingRepository: Repository<BookingEntity>,
  ) {}

  async createBooking(booking: BookingDto) {
    await this.bookingRepository
      .createQueryBuilder()
      .insert()
      .into(BookingEntity)
      .values({
        goodsId: booking.goodsId,
        userId: booking.userId,
      })
      .execute();
  }
}
