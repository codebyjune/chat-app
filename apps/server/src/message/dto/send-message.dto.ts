import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class SendMessageDto {
  @IsInt()
  @Min(1)
  readonly receiverId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  readonly content: string;
}
