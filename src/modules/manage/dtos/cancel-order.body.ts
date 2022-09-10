import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CancelOrderBodyDto {
    @IsString()
    @ApiProperty({ description: '取消原因' })
    reason: string;
}
