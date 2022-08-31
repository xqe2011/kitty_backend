import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min, Max } from 'class-validator';

export class GetCommentsByAreaIDQueryDto {
    @Type(() => Number)
    @Min(1)
    @Max(30)
    @ApiProperty({
        description: '分页参数,一级评论限制数量',
        minimum: 1,
        maximum: 30
    })
    rootLimit: number;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(30)
    @ApiProperty({
        description: '分页参数,二级评论限制数量',
        minimum: 1,
        maximum: 30
    })
    childrenLimit: number;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    @ApiProperty({ description: '分页参数,一级评论开始位置', minimum: 0 })
    rootStart: number;
}
