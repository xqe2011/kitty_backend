import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginByMiniProgramCodeBodyDto {
    @IsString()
    @ApiProperty({ description: '微信小程序Code' })
    code: string;
}
