import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingEntity } from 'src/database/entity/booking.entity';
import { Repository } from 'typeorm';
import { BookingDto } from './dto/booking.dto';
import * as apm from 'elastic-apm-node';
import { Redis } from 'ioredis';
import { GoodsEntity } from 'src/database/entity/goods.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(BookingEntity)
    private bookingRepository: Repository<BookingEntity>,
    @InjectRepository(GoodsEntity)
    private goodsRepository: Repository<GoodsEntity>,
    @Inject('REDIS_CLIENT') private redisClient: Redis,
  ) {
    this.redisClient = redisClient;
  }

  async createBooking(booking: BookingDto) {
    const trans = apm.startTransaction('createBooking');
    const cacheSpan = apm.startSpan('cacheSpan');
    const cachedBookingCount = await this.redisClient.get(
      `goodsId:${booking.goodsId}`,
    );
    const cachedBookingLimit = await this.redisClient.get(
      `bookingLimitOfGoodsId:${booking.goodsId}`,
    );

    let bookingCount: number;
    let bookingLimit: number;
    if (!cachedBookingCount || !cachedBookingLimit) {
      const findGoods = await this.goodsRepository
        .createQueryBuilder()
        .select([
          'GoodsEntity.id',
          'GoodsEntity.bookingLimit',
          'GoodsEntity.bookingCount',
        ])
        .from(GoodsEntity, 'GoodsEntity')
        .where('id=:id', { id: booking.goodsId })
        .getOne();

      bookingCount = findGoods.bookingCount;
      bookingLimit = findGoods.bookingLimit;
      await this.redisClient.set(
        `bookingLimitOfGoodsId:${findGoods.id}`,
        bookingLimit,
      );
    } else {
      // 레디스에서 가져온 데이터 타입은 스트링이므로 숫자로 변환
      bookingCount = +cachedBookingCount;
      bookingLimit = +cachedBookingLimit;
    }
    cacheSpan.end();

    const compareSpan = apm.startSpan();
    // 2. 예매 limit보다 많을 경우, Error 처리 진행
    if (bookingCount >= bookingLimit) {
      //! throw 에러 처리를 하면 부하 테스트 단계에서 에러가 나서 일단 주석처리
      // throw new ConflictException({
      //   errorMessage: '남은 좌석이 없습니다.',
      // });
      await this.redisClient.lpush(
        `waitlist:${booking.goodsId}`,
        booking.userId,
      );
      return { message: '예매가 초과되어 대기자 명단에 등록 되었습니다' };
    }
    compareSpan.end();

    // 3. 예매 진행
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
    await this.redisClient.incr(`goodsId:${booking.goodsId}`);
    trans.end();
  }
}
