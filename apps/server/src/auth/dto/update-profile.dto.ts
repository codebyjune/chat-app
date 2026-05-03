import { IsEmail, IsString, Length } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @Length(3, 50)
  readonly username: string;

  @IsEmail()
  readonly email: string;
}
