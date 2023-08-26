import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { UserEntity } from './entity/user.entity';
import { GoodsEntity } from './entity/goods.entity';
import { BookingEntity } from './entity/booking.entity';

config();

const dataSourceOptions: DataSourceOptions & TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD),
  database: process.env.DB_DATABASE,
  logging: false,
  keepConnectionAlive: true,
  entities: [UserEntity, GoodsEntity, BookingEntity],
  migrations: ['src/database/migrations/*.ts'],
  migrationsTableName: 'migrations',
};

const dataSource = new DataSource(dataSourceOptions);

export { dataSource, dataSourceOptions };
