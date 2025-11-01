import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './schemas/message.schema';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
  ) {}

  async findAllChatsByUser(userId: string) {
    this.logger.log(`findAllChatsByUser: ${userId}`);
    const messages = await this.messageModel.find({
      $or: [
        { senderId: userId },
        { receiverId: userId },
      ],
    }).sort({ timestamp: 1 }).lean();
 this.logger.log(`messages: ${JSON.stringify(messages)}`);
    const chatsMap = new Map<string, any[]>();
    for (const message of messages) {
      const otherUser = message.senderId === userId ? message.receiverId : message.senderId;
      if (!chatsMap.has(otherUser)) {
        chatsMap.set(otherUser, []);
      }
      chatsMap.get(otherUser)?.push(message);
    }
    this.logger.log(JSON.stringify(Array.from(chatsMap.entries())))
    return Array.from(chatsMap.entries()).map(([otherUserId, messages]) => ({
      userId: otherUserId,
      messages,
    }));
  }

  async create(createMessageDto: Partial<Message>): Promise<Message> {
    try {
      const message = new this.messageModel({
        ...createMessageDto,
        timestamp: new Date(),
      });
      const plainMessage = (message as any)?.toObject ? (message as any).toObject() : message;
      this.logger.log(`message to : ${JSON.stringify(plainMessage)}`);
      return await message.save();
    } catch (error: any) {
      this.logger.error(`Error saving message: ${error?.message}`);
      throw error;
    }
  }
}