import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MessageService } from './message.service';

describe('MessageService', () => {
  const sender = {
    id: 1,
    username: 'alice',
    email: 'alice@example.com',
  };
  const receiver = {
    id: 2,
    username: 'bob',
    email: 'bob@example.com',
  };

  let service: MessageService;
  let messageRepository: {
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let userService: {
    findOne: jest.Mock;
  };
  let friendService: {
    areFriends: jest.Mock;
  };

  beforeEach(() => {
    messageRepository = {
      create: jest.fn((input) => input),
      save: jest.fn(async (input) => ({
        id: 1,
        sentAt: new Date('2024-01-01T00:00:00.000Z'),
        readAt: null,
        ...input,
      })),
      update: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    userService = {
      findOne: jest.fn(),
    };

    friendService = {
      areFriends: jest.fn(),
    };

    service = new MessageService(
      messageRepository as never,
      userService as never,
      friendService as never,
    );
  });

  it('rejects sending a message to yourself', async () => {
    await expect(service.sendDirectMessage(1, 1, 'hello')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects sending a message to a non-friend', async () => {
    userService.findOne.mockResolvedValueOnce(sender).mockResolvedValueOnce(receiver);
    friendService.areFriends.mockResolvedValue(false);

    await expect(service.sendDirectMessage(1, 2, 'hello')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('returns messages in ascending order for paginated history', async () => {
    userService.findOne.mockResolvedValue(receiver);
    friendService.areFriends.mockResolvedValue(true);

    const getMany = jest.fn().mockResolvedValue([
      {
        id: 2,
        content: 'newer',
        sentAt: new Date('2024-01-02T00:00:00.000Z'),
        readAt: null,
        sender,
        receiver,
      },
      {
        id: 1,
        content: 'older',
        sentAt: new Date('2024-01-01T00:00:00.000Z'),
        readAt: null,
        sender,
        receiver,
      },
    ]);

    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getMany,
    };
    messageRepository.createQueryBuilder.mockReturnValue(queryBuilder);

    const result = await service.findConversation(1, 2, undefined, 20);

    expect(queryBuilder.limit).toHaveBeenCalledWith(20);
    expect(result.map((message) => message.id)).toEqual([1, 2]);
  });

  it('rejects invalid pagination cursor', async () => {
    userService.findOne.mockResolvedValue(receiver);
    friendService.areFriends.mockResolvedValue(true);

    await expect(service.findConversation(1, 2, 'invalid-date')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('marks unread incoming messages as read', async () => {
    userService.findOne.mockResolvedValue(receiver);
    friendService.areFriends.mockResolvedValue(true);

    const unreadMessages = [
      {
        id: 100,
        content: 'hello',
        sentAt: new Date('2024-01-01T00:00:00.000Z'),
        readAt: null,
        sender: receiver,
        receiver: sender,
      },
    ];

    const getMany = jest.fn().mockResolvedValue(unreadMessages);
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany,
    };
    messageRepository.createQueryBuilder.mockReturnValue(queryBuilder);

    const result = await service.markConversationAsRead(1, 2);

    expect(messageRepository.update).toHaveBeenCalledWith([100], {
      readAt: expect.any(Date),
    });
    expect(result[0].id).toBe(100);
    expect(result[0].readAt).not.toBeNull();
  });

  it('throws when marking messages for a missing user', async () => {
    userService.findOne.mockResolvedValue(null);

    await expect(service.markConversationAsRead(1, 2)).rejects.toThrow(
      NotFoundException,
    );
  });
});
