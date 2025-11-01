import { Controller, Get, Post, Body, Param, Logger, UseGuards, BadRequestException, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { Message } from './schemas/message.schema';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@ApiTags('chat')
@UseGuards(FirebaseAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  private readonly logger = new Logger(ChatController.name);

  @ApiOperation({ summary: 'Trova tutte le chat di un utente' })
  @ApiParam({ name: 'userId', description: 'ID utente' })
  @ApiResponse({ status: 200, description: 'Lista delle chat', type: [Message] })
  @Get(':userId')
  async findAllChatsByUser(@Param('userId') userId: string) {
    this.logger.log(`Get all msgs of userId: ${userId}`);
    return this.chatService.findAllChatsByUser(userId);
  }

  @ApiOperation({ summary: 'Crea un nuovo messaggio' })
  @ApiBody({ type: Message })
  @ApiResponse({ status: 201, description: 'Messaggio creato', type: Message })
  @Post()
  async createMsg(@Body() msg: Partial<Message>, @Req() req: any): Promise<Message> {
    const user = req?.user;
    if (!user?.uid) {
      throw new BadRequestException('Missing authenticated user');
    }
    if (!msg?.receiverId || !msg?.content) {
      throw new BadRequestException('receiverId and content are required');
    }
    msg.senderId = user.uid;
    return this.chatService.create(msg);
  }
}