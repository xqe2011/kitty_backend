import { ApiProperty } from '@nestjs/swagger';

export class GetLikeableEntityResponseDto {
    @ApiProperty({ description: '是否可见' })
    isDisplay: boolean;

    @ApiProperty({ description: "用户是否点赞过" })
    isLiked: boolean;

    @ApiProperty({ description: '是否可重复点赞' })
    allowDuplicateLike: boolean;

    @ApiProperty({ description: '点赞数' })
    count: number;
}
