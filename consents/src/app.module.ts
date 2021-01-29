import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Connection } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { UserEntity } from './users/entities/user.entity';
import { EventEntity } from './events/entities/event.entity';
import * as Joi from 'joi';

let envFilePath = ".development.env";

if (process.env.ENVIRONMENT === "PRODUCTION") {
  envFilePath = ".production.env";
}

@Module({
  imports: [
    ConfigModule.forRoot({ // TODO this can be moved into config module/service
      envFilePath,
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        DB_SYNC: Joi.bool().required(),
        PORT: Joi.number(),
      })
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT, 10),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [
        UserEntity,
        EventEntity,
      ],
      synchronize: true, // TODO disable this for production
      keepConnectionAlive: true,
      retryAttempts: 2,
      retryDelay: 1000,
      // TODO Set "autoLoadEntities: true," though this won't work for the ChangeEntity https://docs.nestjs.com/techniques/database#auto-load-entities
    }),
    EventEmitterModule.forRoot(),
    UsersModule, 
    EventsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {
  constructor(private connection: Connection) { }
}
