import { UserEntity } from './user.entity';
import { GoodsEntity } from './goods.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BookingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
  })
  userId: number;

  @Column({
    nullable: false,
  })
  goodsId: number;

  @ManyToOne(() => UserEntity, (user) => user.booking, {
    cascade: true,
    eager: false,
  })
  user: UserEntity;

  @ManyToOne(() => GoodsEntity, (goods) => goods.booking, {
    cascade: true,
    eager: false,
  })
  goods: GoodsEntity;
}
