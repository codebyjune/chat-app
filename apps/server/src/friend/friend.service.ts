import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friend } from './friend.entity';
import { UserService } from '../user/user.service';
import { FriendStatus } from './friend-status.enum';

type FriendUserSummary = {
  id: number;
  username: string;
  email: string;
};

export type FriendRequestResponse = {
  id: number;
  status: FriendStatus;
  requester: FriendUserSummary;
  addressee: FriendUserSummary;
  createdAt: Date;
  updatedAt: Date;
};

export type FriendListItem = {
  friendshipId: number;
  friend: FriendUserSummary;
  createdAt: Date;
};

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,
    private readonly userService: UserService,
  ) {}

  async sendRequest(
    requesterId: number,
    addresseeId: number,
  ): Promise<FriendRequestResponse> {
    if (requesterId === addresseeId) {
      throw new BadRequestException('You cannot add yourself as a friend');
    }

    const [requester, addressee] = await Promise.all([
      this.userService.findOne(requesterId),
      this.userService.findOne(addresseeId),
    ]);

    if (!requester) {
      throw new NotFoundException('Requester not found');
    }

    if (!addressee) {
      throw new NotFoundException('Target user not found');
    }

    const existingFriendship = await this.findFriendshipBetween(
      requesterId,
      addresseeId,
    );

    if (existingFriendship) {
      if (existingFriendship.status === FriendStatus.ACCEPTED) {
        throw new BadRequestException('You are already friends');
      }

      if (existingFriendship.status === FriendStatus.PENDING) {
        throw new BadRequestException('A friend request already exists');
      }

      existingFriendship.status = FriendStatus.PENDING;
      existingFriendship.requester = requester;
      existingFriendship.addressee = addressee;

      const updatedFriendship = await this.friendRepository.save(
        existingFriendship,
      );

      return this.toFriendRequestResponse(updatedFriendship);
    }

    const friendRequest = await this.friendRepository.save(
      this.friendRepository.create({
        requester,
        addressee,
        status: FriendStatus.PENDING,
      }),
    );

    return this.toFriendRequestResponse(friendRequest);
  }

  async acceptRequest(
    requestId: number,
    currentUserId: number,
  ): Promise<FriendRequestResponse> {
    const request = await this.friendRepository.findOne({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Friend request not found');
    }

    if (request.addressee.id !== currentUserId) {
      throw new ForbiddenException('You cannot accept this friend request');
    }

    if (request.status !== FriendStatus.PENDING) {
      throw new BadRequestException('This friend request cannot be accepted');
    }

    request.status = FriendStatus.ACCEPTED;

    return this.toFriendRequestResponse(
      await this.friendRepository.save(request),
    );
  }

  async rejectRequest(
    requestId: number,
    currentUserId: number,
  ): Promise<FriendRequestResponse> {
    const request = await this.friendRepository.findOne({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Friend request not found');
    }

    if (request.addressee.id !== currentUserId) {
      throw new ForbiddenException('You cannot reject this friend request');
    }

    if (request.status !== FriendStatus.PENDING) {
      throw new BadRequestException('This friend request cannot be rejected');
    }

    request.status = FriendStatus.REJECTED;

    return this.toFriendRequestResponse(
      await this.friendRepository.save(request),
    );
  }

  async listFriends(currentUserId: number): Promise<FriendListItem[]> {
    const friendships = await this.friendRepository.find({
      where: [
        {
          requester: { id: currentUserId },
          status: FriendStatus.ACCEPTED,
        },
        {
          addressee: { id: currentUserId },
          status: FriendStatus.ACCEPTED,
        },
      ],
      order: {
        updatedAt: 'DESC',
      },
    });

    return friendships.map((friendship) => ({
      friendshipId: friendship.id,
      friend: this.toUserSummary(
        friendship.requester.id === currentUserId
          ? friendship.addressee
          : friendship.requester,
      ),
      createdAt: friendship.createdAt,
    }));
  }

  async removeFriendship(friendId: number, currentUserId: number): Promise<void> {
    const friendship = await this.findAcceptedFriendship(currentUserId, friendId);

    if (!friendship) {
      throw new NotFoundException('Friendship not found');
    }

    await this.friendRepository.remove(friendship);
  }

  async findPendingRequestsForUser(
    currentUserId: number,
  ): Promise<FriendRequestResponse[]> {
    const requests = await this.friendRepository.find({
      where: {
        addressee: { id: currentUserId },
        status: FriendStatus.PENDING,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return requests.map((request) => this.toFriendRequestResponse(request));
  }

  async areFriends(userId: number, otherUserId: number): Promise<boolean> {
    const friendship = await this.findAcceptedFriendship(userId, otherUserId);
    return Boolean(friendship);
  }

  private async findAcceptedFriendship(userId: number, otherUserId: number) {
    return this.friendRepository.findOne({
      where: [
        {
          requester: { id: userId },
          addressee: { id: otherUserId },
          status: FriendStatus.ACCEPTED,
        },
        {
          requester: { id: otherUserId },
          addressee: { id: userId },
          status: FriendStatus.ACCEPTED,
        },
      ],
    });
  }

  private async findFriendshipBetween(userId: number, otherUserId: number) {
    return this.friendRepository.findOne({
      where: [
        {
          requester: { id: userId },
          addressee: { id: otherUserId },
        },
        {
          requester: { id: otherUserId },
          addressee: { id: userId },
        },
      ],
    });
  }

  private toFriendRequestResponse(friendship: Friend): FriendRequestResponse {
    return {
      id: friendship.id,
      status: friendship.status,
      requester: this.toUserSummary(friendship.requester),
      addressee: this.toUserSummary(friendship.addressee),
      createdAt: friendship.createdAt,
      updatedAt: friendship.updatedAt,
    };
  }

  private toUserSummary(user: {
    id: number;
    username: string;
    email: string;
  }): FriendUserSummary {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
    };
  }
}
