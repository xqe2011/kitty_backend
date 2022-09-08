import { ApiProperty } from '@nestjs/swagger';

export class GetUserInfoResponseDto {
    @ApiProperty({ description: '用户昵称' })
    nickName: string;

    @ApiProperty({ description: '头像文件名' })
    avatarFileName: string;

    @ApiProperty({ description: '用户ID', minimum: 1 })
    id: number;
}
