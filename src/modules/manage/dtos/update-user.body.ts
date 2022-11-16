import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { Role } from 'src/modules/user/enums/role.enum';

export class UpdateUserBodyDto {
    @IsOptional()
    @IsEnum(Role)
    @ApiProperty({ description: '用户角色,用户需要有头像和昵称才能修改到除了0和1以外的角色,0表示禁用账户,1表示未注册用户,2表示已注册用户,3表示管理员' })
    role: Role;
}
