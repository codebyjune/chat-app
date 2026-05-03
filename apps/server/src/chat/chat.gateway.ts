import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { MessageService } from '../message/message.service';
import { SendMessageDto } from '../message/dto/send-message.dto';

type AuthenticatedSocket = Socket & {
  data: {
    user?: {
      userId: number;
      username: string;
    };
  };
};

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
export class ChatGateway
  implements OnGatewayConnection<AuthenticatedSocket>, OnGatewayDisconnect<AuthenticatedSocket>
{
  @WebSocketServer()
  server: Server;

  private readonly userSocketCounts = new Map<number, number>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly messageService: MessageService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = this.extractToken(client);
      const payload = await this.jwtService.verifyAsync<{
        sub: number;
        username: string;
      }>(token, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });

      client.data.user = {
        userId: payload.sub,
        username: payload.username,
      };

      await client.join(this.getUserRoom(payload.sub));
      this.trackUserConnection(payload.sub);
      this.server
        .to(this.getUserRoom(payload.sub))
        .emit('presence:update', { userId: payload.sub, online: true });
    } catch {
      client.emit('chat:error', { message: 'Unauthorized' });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.data.user?.userId;

    if (!userId) {
      return;
    }

    const isStillOnline = this.trackUserDisconnection(userId);

    if (!isStillOnline) {
      this.server
        .to(this.getUserRoom(userId))
        .emit('presence:update', { userId, online: false });
    }
  }

  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  @SubscribeMessage('chat:send')
  async handleSendMessage(
    @MessageBody() sendMessageDto: SendMessageDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const currentUser = client.data.user;

    if (!currentUser) {
      throw new UnauthorizedException('Unauthorized');
    }

    const message = await this.messageService.sendDirectMessage(
      currentUser.userId,
      sendMessageDto.receiverId,
      sendMessageDto.content,
    );

    const senderRoom = this.getUserRoom(message.senderId);
    const receiverRoom = this.getUserRoom(message.receiverId);

    this.server.to(senderRoom).emit('chat:message', message);
    this.server.to(receiverRoom).emit('chat:message', message);

    return message;
  }

  @SubscribeMessage('chat:read')
  async handleReadConversation(
    @MessageBody() body: { otherUserId: number },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const currentUser = client.data.user;

    if (!currentUser) {
      throw new UnauthorizedException('Unauthorized');
    }

    const updatedMessages = await this.messageService.markConversationAsRead(
      currentUser.userId,
      body.otherUserId,
    );

    if (updatedMessages.length) {
      this.server.to(this.getUserRoom(body.otherUserId)).emit('chat:read', {
        userId: currentUser.userId,
        messageIds: updatedMessages.map((message) => message.id),
        readAt: updatedMessages[0].readAt,
      });
    }

    return updatedMessages;
  }

  private extractToken(client: Socket): string {
    const token = client.handshake.auth.token;

    if (typeof token !== 'string' || token.trim().length === 0) {
      throw new UnauthorizedException('Missing token');
    }

    return token;
  }

  private getUserRoom(userId: number): string {
    return `user:${userId}`;
  }

  private trackUserConnection(userId: number) {
    this.userSocketCounts.set(userId, (this.userSocketCounts.get(userId) ?? 0) + 1);
  }

  private trackUserDisconnection(userId: number): boolean {
    const nextCount = (this.userSocketCounts.get(userId) ?? 1) - 1;

    if (nextCount <= 0) {
      this.userSocketCounts.delete(userId);
      return false;
    }

    this.userSocketCounts.set(userId, nextCount);
    return true;
  }
}
