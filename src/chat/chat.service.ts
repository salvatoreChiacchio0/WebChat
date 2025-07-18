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
    const messages = await this.messageModel.find({
      $or: [
        { senderId: userId },
        { receiverId: userId },
      ],
    }).sort({ timestamp: 1 }).lean();

    const chatsMap = new Map<string, any[]>();
    for (const message of messages) {
      const otherUser = message.senderId === userId ? message.receiverId : message.senderId;
      if (!chatsMap.has(otherUser)) {
        chatsMap.set(otherUser, []);
      }
      chatsMap.get(otherUser)?.push(message);
    }
    return Array.from(chatsMap.entries()).map(([otherUserId, messages]) => ({
      userId: otherUserId,
      messages,
    }));
  }

  async create(createMessageDto: Partial<Message>): Promise<Message> {
    const message = new this.messageModel({
      ...createMessageDto,
      timestamp: new Date(),
    });
    return message.save();
  }
}