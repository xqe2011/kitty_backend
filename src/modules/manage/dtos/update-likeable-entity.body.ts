import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateLikeableEntityBodyDto {
    @IsBoolean()
    @ApiProperty({ description: '是否展示' })
    isDisplay: boolean;

    @IsBoolean()
    @ApiProperty({ description: '允许同一个人重复喜欢' })
    allowDuplicateLike: boolean;
}
