import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

export type UserSearchResult = {
  id: number;
  username: string;
  email: string;
  createdAt: Date;
};

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findOne(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  findOneByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'username', 'email', 'password', 'createdAt'],
    });
  }

  async searchUsers(
    query: string,
    currentUserId: number,
  ): Promise<UserSearchResult[]> {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return [];
    }

    const normalizedQuery = trimmedQuery.toLowerCase();

    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id != :currentUserId', { currentUserId })
      .andWhere(
        '(LOWER(user.username) LIKE :query OR LOWER(user.email) LIKE :query)',
        { query: `%${normalizedQuery}%` },
      )
      .orderBy('user.createdAt', 'DESC')
      .limit(10)
      .getMany();

    return users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    }));
  }

  create(user: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }

  async update(id: number, user: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, user);
    return this.findOne(id);
  }

  async updateProfile(
    id: number,
    input: { username: string; email: string },
  ): Promise<User> {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const normalizedEmail = input.email.trim().toLowerCase();
    const existingUser = await this.findOneByEmail(normalizedEmail);

    if (existingUser && existingUser.id !== id) {
      throw new ConflictException('Email already exists');
    }

    user.username = input.username.trim();
    user.email = normalizedEmail;

    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
