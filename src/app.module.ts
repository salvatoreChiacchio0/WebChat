import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { RedisModule } from './redis/redis.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/chatDB',
      }),
      inject: [ConfigService],
    }),
    ChatModule,
    RedisModule,
    AuthModule,
  ],
})
export class AppModule {}