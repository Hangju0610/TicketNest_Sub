import { Module } from '@nestjs/common';
import { BookingProcessor } from './booking.controller';
import { BookingService } from './booking.service';
import { RedisModule } from 'src/redis/redis.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingEntity } from 'src/database/entity/booking.entity';
import { GoodsEntity } from 'src/database/entity/goods.entity';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    RedisModule,
    BullModule.registerQueue({ name: 'Ticket' }),
    TypeOrmModule.forFeature([BookingEntity, GoodsEntity]),
  ],
  // controllers: [BookingController],
  providers: [BookingService, BookingProcessor],
})
export class BookingModule {}
