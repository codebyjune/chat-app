import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { FriendService } from './friend.service';
import { FriendStatus } from './friend-status.enum';

describe('FriendService', () => {
  const requester = {
    id: 1,
    username: 'alice',
    email: 'alice@example.com',
  };
  const addressee = {
    id: 2,
    username: 'bob',
    email: 'bob@example.com',
  };

  let service: FriendService;
  let friendRepository: {
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };
  let userService: {
    findOne: jest.Mock;
  };

  beforeEach(() => {
    friendRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((input) => input),
      save: jest.fn(async (input) => ({
        id: input.id ?? 1,
        createdAt: input.createdAt ?? new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        ...input,
      })),
      remove: jest.fn(),
    };

    userService = {
      findOne: jest.fn(),
    };

    service = new FriendService(friendRepository as never, userService as never);
  });

  it('rejects adding yourself as a friend', async () => {
    await expect(service.sendRequest(1, 1)).rejects.toThrow(BadRequestException);
  });

  it('creates a new pending friend request', async () => {
    userService.findOne.mockResolvedValueOnce(requester).mockResolvedValueOnce(addressee);
    friendRepository.findOne.mockResolvedValue(null);

    const result = await service.sendRequest(1, 2);

    expect(friendRepository.create).toHaveBeenCalledWith({
      requester,
      addressee,
      status: FriendStatus.PENDING,
    });
    expect(result.status).toBe(FriendStatus.PENDING);
    expect(result.requester.id).toBe(1);
    expect(result.addressee.id).toBe(2);
  });

  it('rejects duplicate pending requests', async () => {
    userService.findOne.mockResolvedValueOnce(requester).mockResolvedValueOnce(addressee);
    friendRepository.findOne.mockResolvedValue({
      id: 99,
      requester,
      addressee,
      status: FriendStatus.PENDING,
    });

    await expect(service.sendRequest(1, 2)).rejects.toThrow(BadRequestException);
  });

  it('accepts a pending request for the addressee', async () => {
    friendRepository.findOne.mockResolvedValue({
      id: 10,
      requester,
      addressee,
      status: FriendStatus.PENDING,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    });

    const result = await service.acceptRequest(10, 2);

    expect(friendRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: FriendStatus.ACCEPTED }),
    );
    expect(result.status).toBe(FriendStatus.ACCEPTED);
  });

  it('forbids accepting someone else request', async () => {
    friendRepository.findOne.mockResolvedValue({
      id: 10,
      requester,
      addressee,
      status: FriendStatus.PENDING,
    });

    await expect(service.acceptRequest(10, 3)).rejects.toThrow(ForbiddenException);
  });

  it('removes an accepted friendship', async () => {
    const friendship = {
      id: 11,
      requester,
      addressee,
      status: FriendStatus.ACCEPTED,
    };
    friendRepository.findOne.mockResolvedValue(friendship);

    await service.removeFriendship(2, 1);

    expect(friendRepository.remove).toHaveBeenCalledWith(friendship);
  });

  it('throws when removing a missing friendship', async () => {
    friendRepository.findOne.mockResolvedValue(null);

    await expect(service.removeFriendship(2, 1)).rejects.toThrow(NotFoundException);
  });
});
