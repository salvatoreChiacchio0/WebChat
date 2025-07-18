import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ collection: 'messages' })
export class Message extends Document {
  @ApiProperty({ description: 'ID del messaggio' })
  _id: string;

  @ApiProperty({ description: 'ID  mittente' })
  senderId: string;

  @ApiProperty({ description: 'ID destinatario' })
  receiverId: string;

  @ApiProperty({ description: 'Contenuto del messaggio' })
  content: string;

  @ApiProperty({ description: 'Timestamp di invio' })
  timestamp: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message); 