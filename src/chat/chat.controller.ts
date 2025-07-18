import { Controller, Get, Post, Body, Param, Logger, UseGuards } from '@nestjs/common';
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
    return this.chatService.findAllChatsByUser(userId);
  }

  @ApiOperation({ summary: 'Crea un nuovo messaggio' })
  @ApiBody({ type: Message })
  @ApiResponse({ status: 201, description: 'Messaggio creato', type: Message })
  @Post()
  async createMsg(@Body() msg: Partial<Message>): Promise<Message> {
    return this.chatService.create(msg);
  }
}