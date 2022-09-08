import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator'

export class UpdateCommentsAreaBodyDto {
    @IsBoolean()
    @ApiProperty({ description: '评论区是否展示' })
    isDisplay: boolean;
}
