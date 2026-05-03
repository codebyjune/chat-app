import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { UserService } from '../user/user.service';
import { MessageResponse } from './message.types';
import { FriendService } from '../friend/friend.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly userService: UserService,
    private readonly friendService: FriendService,
  ) {}

  async create(message: Partial<Message>): Promise<Message> {
    const newMessage = this.messageRepository.create(message);
    return this.messageRepository.save(newMessage);
  }

  async sendDirectMessage(
    senderId: number,
    receiverId: number,
    content: string,
  ): Promise<MessageResponse> {
    if (senderId === receiverId) {
      throw new BadRequestException('You cannot send a message to yourself');
    }

    const [sender, receiver] = await Promise.all([
      this.userService.findOne(senderId),
      this.userService.findOne(receiverId),
    ]);

    if (!sender) {
      throw new NotFoundException('Sender not found');
    }

    if (!receiver) {
      throw new NotFoundException('Receiver not found');
    }

    const canChat = await this.friendService.areFriends(senderId, receiverId);

    if (!canChat) {
      throw new BadRequestException('Only friends can chat with each other');
    }

    const message = await this.messageRepository.save(
      this.messageRepository.create({
        content,
        sender,
        receiver,
      }),
    );

    return this.toMessageResponse({
      ...message,
      sender,
      receiver,
    });
  }

  async findConversation(
    currentUserId: number,
    otherUserId: number,
    before?: string,
    limit = 20,
  ): Promise<MessageResponse[]> {
    const otherUser = await this.userService.findOne(otherUserId);

    if (!otherUser) {
      throw new NotFoundException('User not found');
    }

    const canChat = await this.friendService.areFriends(
      currentUserId,
      otherUserId,
    );

    if (!canChat) {
      throw new BadRequestException('Only friends can view chat history');
    }

    const normalizedLimit = Math.min(Math.max(limit, 1), 50);
    const beforeDate = before ? new Date(before) : null;

    if (before && (!beforeDate || Number.isNaN(beforeDate.getTime()))) {
      throw new BadRequestException('Invalid before cursor');
    }

    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .where(
        '(sender.id = :currentUserId AND receiver.id = :otherUserId) OR (sender.id = :otherUserId AND receiver.id = :currentUserId)',
        { currentUserId, otherUserId },
      );

    if (beforeDate) {
      queryBuilder.andWhere('message.sentAt < :beforeDate', { beforeDate });
    }

    const messages = await queryBuilder
      .orderBy('message.sentAt', 'DESC')
      .limit(normalizedLimit)
      .getMany();

    return messages
      .reverse()
      .map((message) => this.toMessageResponse(message));
  }

  async markConversationAsRead(
    currentUserId: number,
    otherUserId: number,
  ): Promise<MessageResponse[]> {
    const otherUser = await this.userService.findOne(otherUserId);

    if (!otherUser) {
      throw new NotFoundException('User not found');
    }

    const canChat = await this.friendService.areFriends(currentUserId, otherUserId);

    if (!canChat) {
      throw new BadRequestException('Only friends can update read status');
    }

    const unreadMessages = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .where('sender.id = :otherUserId', { otherUserId })
      .andWhere('receiver.id = :currentUserId', { currentUserId })
      .andWhere('message.readAt IS NULL')
      .orderBy('message.sentAt', 'ASC')
      .getMany();

    if (!unreadMessages.length) {
      return [];
    }

    const readAt = new Date();

    await this.messageRepository.update(
      unreadMessages.map((message) => message.id),
      { readAt },
    );

    return unreadMessages.map((message) =>
      this.toMessageResponse({
        ...message,
        readAt,
      }),
    );
  }

  private toMessageResponse(message: Message): MessageResponse {
    return {
      id: message.id,
      content: message.content,
      sentAt: message.sentAt,
      readAt: message.readAt,
      senderId: message.sender.id,
      receiverId: message.receiver.id,
    };
  }
}
