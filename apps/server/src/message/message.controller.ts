import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('conversation/:userId')
  findConversation(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('before') before: string | undefined,
    @Query('limit') limit: string | undefined,
    @Request() req: { user: { userId: number } },
  ) {
    return this.messageService.findConversation(
      req.user.userId,
      userId,
      before,
      limit ? Number(limit) : undefined,
    );
  }
}
