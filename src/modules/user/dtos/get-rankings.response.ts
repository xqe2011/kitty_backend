import { ApiProperty } from '@nestjs/swagger';

export class GetRankingResponseDto {
    @ApiProperty({ description: '头像文件名' })
    avatarFileName: string;

    @ApiProperty({ description: '用户当前积分' })
    points: number;

    @ApiProperty({ description: '用户ID', minimum: 1 })
    id: number;

    @ApiProperty({ description: '用户昵称' })
    nickName: string;
}
