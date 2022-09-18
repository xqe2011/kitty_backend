import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/modules/user/enums/role.enum';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, } from '@nestjs/swagger';
import { UserService } from 'src/modules/user/user/user.service';
import { GetUserInfoParamDto } from '../dtos/get-user-info.param';
import { GetUserInfoResponseDto } from '../dtos/get-user-info.response';

@Controller('/manage')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.Admin, Role.RegisteredUser)
@ApiBearerAuth()
@ApiTags('管理')
export class UserController {
    constructor(
        private userService: UserService
    ) { }

    @Get('user/:id')
    @ApiOperation({
        summary: '获取用户详细信息',
        description: '获取用户详细信息,需要管理员权限'
    })
    @ApiOkResponse({
        description: '获取用户详细信息',
        type: GetUserInfoResponseDto
    })
    async getUserInfo(@Param() param: GetUserInfoParamDto) {
        return await this.userService.getUserInfoByID(param.id, true);
    }

}
