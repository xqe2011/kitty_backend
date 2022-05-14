import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../enums/role.enum';

export class GetUserInfoResponseDto {
    @ApiProperty({
        description: '用户角色,只有查询当前用户时会返回,其他时候返回null,0表示禁用账户,1表示未注册用户,2表示已注册用户,3表示管理员',
        enum: Role,
        required: false,
    })
    role: Role;

    @ApiProperty({ description: '用户昵称' })
    nickName: string;

    @ApiProperty({ description: '头像文件名' })
    avatarFileName: string;

    @ApiProperty({ description: '用户ID', minimum: 1 })
    id: number;

    @ApiProperty({
        description: '用户当前积分,只有查询当前用户时会返回,其他时候返回null',
        required: false,
    })
    points: number;
}
