import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { FriendService } from './friend.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SendFriendRequestDto } from './dto/send-friend-request.dto';

const friendValidationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
});

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Post('request')
  sendRequest(
    @Body(friendValidationPipe) body: SendFriendRequestDto,
    @Request() req: { user: { userId: number } },
  ) {
    return this.friendService.sendRequest(req.user.userId, body.userId);
  }

  @Patch('request/:id/accept')
  acceptRequest(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: number } },
  ) {
    return this.friendService.acceptRequest(id, req.user.userId);
  }

  @Patch('request/:id/reject')
  rejectRequest(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: number } },
  ) {
    return this.friendService.rejectRequest(id, req.user.userId);
  }

  @Get()
  listFriends(@Request() req: { user: { userId: number } }) {
    return this.friendService.listFriends(req.user.userId);
  }

  @Get('requests/pending')
  listPendingRequests(@Request() req: { user: { userId: number } }) {
    return this.friendService.findPendingRequestsForUser(req.user.userId);
  }

  @Delete(':friendId')
  removeFriend(
    @Param('friendId', ParseIntPipe) friendId: number,
    @Request() req: { user: { userId: number } },
  ) {
    return this.friendService.removeFriendship(friendId, req.user.userId);
  }
}
