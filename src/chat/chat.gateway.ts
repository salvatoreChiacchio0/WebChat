import { Logger, Inject } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { RedisClientType } from 'redis';
import * as admin from 'firebase-admin';
import { Message } from './schemas/message.schema';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  },
  namespace: '/',
  transports: ['websocket'],
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType,
    private readonly chatService: ChatService,
  ) {}

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = this.extractTokenFromHandshake(client);
      if (!token) {
        client.disconnect(true);
        this.logger.warn('Client disconnected: No token provided.');
        return;
      }

      const decoded = await admin.auth().verifyIdToken(token);
      const userId = decoded.uid;
      await this.redisClient.set(`user:${userId}`, client.id, { EX: 1800 });
      this.logger.log(`Client connected: ${client.id} for user ${userId}`);

      (client as any).userId = userId;
    } catch (error: any) {
      this.logger.error(`Connection handling error: ${error.message}`);
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const userId = (client as any).userId;
      if (userId) {
        await this.redisClient.del(`user:${userId}`);
        this.logger.log(`Removed user id: ${userId} from Redis`);
      }
    } catch (error) {
      this.logger.error(`Error during disconnect: ${error.message}`);
    }
  }

  @SubscribeMessage('send')
  async handleMessage(@MessageBody() data: Partial<Message>, @ConnectedSocket() client: Socket) {
    const authenticatedUserId = (client as any).userId as string | undefined;
    if (!authenticatedUserId) {
      this.logger.warn('Socket not authenticated. Cannot send message.');
      return;
    }

    if (!data?.receiverId || !data?.content) {
      this.logger.warn(`Invalid message payload received: ${JSON.stringify(data)}`);
      return;
    }

    data.senderId = authenticatedUserId;
    const message = await this.chatService.create(data);
    this.logger.log(`message: ${message}`);
    this.logger.log(`user: ${data.senderId} sent message to user: ${data.receiverId}`);
    // Emit the saved message (with timestamp/id) to the receiver
    this.sendMSGtoReceiver(message);
  }
  private async sendMSGtoReceiver(message: Partial<Message>) {

    this.logger.log(`redis client: ${JSON.stringify(message)}`);
    const recipientSocketId = await this.redisClient.get(`user:${message.receiverId}`);
    if (recipientSocketId) {
      this.server.to(recipientSocketId).emit('receive', message);
      this.logger.log(`Message sent to receiver ${message.receiverId} via socket ${recipientSocketId}`);
    } else {
      this.logger.warn(`Recipient with id ${message.receiverId} is not online`);
    }
  }

  private extractTokenFromHandshake(client: Socket): string | null {
    try {
      // Prefer token via Socket.IO auth payload
      if (client.handshake.auth && client.handshake.auth.token) {
        return client.handshake.auth.token as string;
      }
      // Fallback: token via query string ?token=...
      const queryToken = (client.handshake.query?.token as string) || null;
      if (queryToken) {
        return queryToken;
      }
      // Lastly: Authorization header
      const authHeader = client.handshake.headers.authorization;
      if (!authHeader) {
        return null;
      }
      const [type, token] = authHeader.split(' ');
      if (type !== 'Bearer') {
        return null;
      }
      return token;
    } catch (error) {
      this.logger.error(`Error extracting token: ${error.message}`);
      return null;
    }
  }
}