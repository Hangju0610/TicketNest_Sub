import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { RedisModule } from 'src/redis/redis.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingEntity } from 'src/database/entity/booking.entity';
import { GoodsEntity } from 'src/database/entity/goods.entity';

@Module({
  imports: [
    RedisModule,
    TypeOrmModule.forFeature([BookingEntity, GoodsEntity]),
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
