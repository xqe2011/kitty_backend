import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class ChangeUserPointsBodyDto {
    @IsNumber()
    @ApiProperty({ description: '需要增减的积分,例如10为增加10积分,-10为减少10积分' })
    points: number;

    @IsString()
    @ApiProperty({ description: '增减原因' })
    reason: string;
}
