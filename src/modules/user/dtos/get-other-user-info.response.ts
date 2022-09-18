import { ApiProperty } from '@nestjs/swagger';

export class GetOtherUserInfoResponseDto {
    @ApiProperty({ description: '用户昵称', nullable: true })
    nickName: string;

    @ApiProperty({ description: '头像文件名', nullable: true })
    avatarFileName: string;

    @ApiProperty({ description: '用户ID', minimum: 1 })
    id: number;
}
