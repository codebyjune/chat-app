import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { User } from './user/user.entity';
import { MessageModule } from './message/message.module';
import { Message } from './message/message.entity';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './chat/chat.module';
import { FriendModule } from './friend/friend.module';
import { Friend } from './friend/friend.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USERNAME ?? 'chat_user',
      password: process.env.DB_PASSWORD ?? '123456',
      database: process.env.DB_DATABASE ?? 'chat_backend',
      entities: [User, Message, Friend],
      synchronize: (process.env.DB_SYNCHRONIZE ?? 'true') === 'true',
    }),
    UserModule,
    MessageModule,
    AuthModule,
    FriendModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
