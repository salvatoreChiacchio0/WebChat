import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ collection: 'messages' })
export class Message extends Document {
  @ApiProperty({ description: 'ID del messaggio' })
  _id: string;

  @ApiProperty({ description: 'ID  mittente' })
  @Prop({ type: String, required: true, index: true })
  senderId: string;

  @ApiProperty({ description: 'ID destinatario' })
  @Prop({ type: String, required: true, index: true })
  receiverId: string;

  @ApiProperty({ description: 'Contenuto del messaggio' })
  @Prop({ type: String, required: true })
  content: string;

  @ApiProperty({ description: 'Timestamp di invio' })
  @Prop({ type: Date, required: true, default: () => new Date(), index: true })
  timestamp: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);