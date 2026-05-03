import {
  Controller,
  Get,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('search')
  search(
    @Query('query') query: string,
    @Request() req: { user: { userId: number } },
  ) {
    return this.userService.searchUsers(query ?? '', req.user.userId);
  }
}
