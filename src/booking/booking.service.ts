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

  async createBooking(booking) {
    const trans = apm.startTransaction('createBooking');
    // 캐시된 LimitData 획득
    // test 하기 전 cachedBookingLimit를 Redis에 Set 부탁드립니다.
    const cachedBookingLimit = await this.redisClient.get(
      `bookingLimitOfGoodsId:${booking.goodsId}`,
    );

    // 이 Logic을 제외시킨 이유
    // 처음 cachedBookingLimit이 없는 경우
    // cachedBookingLimit이 0으로 된 상태, -> Waitlist로직으로 이동
    // 일관성 오류 발생 (첫번째로 예매한 녀석이 대기열로 간다??)
    // 캐시된 데이터가 없는 경우
    // let bookingLimit: number;
    // if (!cachedBookingLimit) {
    //   const findGoods = await this.goodsRepository
    //     .createQueryBuilder()
    //     .select(['GoodsEntity.id', 'GoodsEntity.bookingLimit'])
    //     .where('id=:id', { id: Number(booking.goodsId) })
    //     .getOne();

    //   bookingLimit = findGoods.bookingLimit;
    //   await this.redisClient.set(
    //     `bookingLimitOfGoodsId:${findGoods.id}`,
    //     bookingLimit,
    //   );
    // } else {
    //   // 레디스에서 가져온 데이터 타입은 스트링이므로 숫자로 변환
    //   bookingLimit = +cachedBookingLimit;
    // }

    // Redis Transaction 진행
    // count +1 증가
    const count = await this.redisClient
      .multi()
      .incr(`goodsId:${booking.goodsId}`)
      .exec();
    // count는 [error: Error , result: unknown]으로 구성되어있다.
    // result가 Counting 된 값으로, 이것을 통해 비교

    // 2. 좌석이 없는 경우 대기자 명단으로 등록
    if (+count[0][1] > +cachedBookingLimit) {
      await this.redisClient.lpush(
        `waitlist:${booking.goodsId}`,
        booking.userId,
      );

      trans.end();
      return {
        message: `예매가 초과되어 대기자 명단에 등록 되었습니다. Count: ${count[0][1]}`,
      };
    }

    // 3. 예매 진행
    await this.bookingRepository
      .createQueryBuilder()
      .insert()
      .into(BookingEntity)
      .values({
        goodsId: booking.goodsId,
        userId: booking.userId,
      })
      .execute();

    trans.end();

    return { message: `${count[0][1]}번 예매 완료` };
  }
}
