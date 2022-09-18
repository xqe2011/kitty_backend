import { Body, Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { UpdateUserInfoBodyDto } from '../dtos/update-user-info.body';
import { UserService } from './user.service';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { Role } from 'src/modules/user/enums/role.enum';
import { AuthGuard } from '@nestjs/passport';
import { GetOtherUserInfoParamDto } from '../dtos/get-other-user-info.param';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, } from '@nestjs/swagger';
import { GetOtherUserInfoResponseDto } from '../dtos/get-other-user-info.response';
import { GetCurrentUserInfoResponseDto } from '../dtos/get-current-user-info.response';
import { UpdateUserInfoResponseDto } from '../dtos/update-user-info.response';

@Controller('/')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
@ApiTags('用户')
export class UserController {
    constructor(
        private userService: UserService
    ) {}

    @Put('/user')
    @Roles(Role.NormalUser, Role.RegisteredUser, Role.Admin)
    @ApiOperation({ summary: '更新当前用户信息' })
    @ApiOkResponse({
        description: '更新成功',
        type: UpdateUserInfoResponseDto,
    })
    async update(@Req() request, @Body() body: UpdateUserInfoBodyDto) {
        await this.userService.updateUserinfoAndRole(
            request.user.id,
            body.nickName,
            body.avatarFileToken,
        );
        return {};
    }

    @Get('/user/:id')
    @Roles(Role.NormalUser, Role.RegisteredUser, Role.Admin)
    @ApiOperation({ summary: '获取用户信息' })
    @ApiOkResponse({
        description: '获取成功',
        type: GetOtherUserInfoResponseDto,
    })
    async getInfo(@Param() param: GetOtherUserInfoParamDto) {
        return await this.userService.getUserInfoByID(param.id, false);
    }

    @Get('/user')
    @Roles(Role.NormalUser, Role.RegisteredUser, Role.Admin)
    @ApiOperation({ summary: '获取当前用户信息' })
    @ApiOkResponse({
        description: '获取成功',
        type: GetCurrentUserInfoResponseDto,
    })
    async getCurrentInfo(@Req() request) {
        return await this.userService.getUserInfoByID(request.user.id, true);
    }
}
