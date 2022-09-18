import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../enums/role.enum';

export class GetCurrentUserInfoResponseDto {
    @ApiProperty({ description: '注册时间' })
    createdDate: Date;

    @ApiProperty({ description: '上次登录时间' })
    lastLoginDate: Date;

    @ApiProperty({
        description: '用户角色,0表示禁用账户,1表示未注册用户,2表示已注册用户,3表示管理员',
        enum: Role
    })
    role: Role;

    @ApiProperty({ description: '用户昵称', nullable: true })
    nickName: string;

    @ApiProperty({ description: '头像文件名', nullable: true })
    avatarFileName: string;

    @ApiProperty({ description: '用户ID', minimum: 1 })
    id: number;

    @ApiProperty({ description: '用户当前积分' })
    points: number;
}
