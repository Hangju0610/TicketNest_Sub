import { IsNumber } from 'class-validator';

export class BookingDto {
  @IsNumber()
  goodsId: number;

  @IsNumber()
  userId: number;
}
