import { Body, Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { UpdateUserInfoBodyDto } from '../dtos/update-user-info.body';
import { UsersService } from '../user/users.service';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { Role } from 'src/modules/user/enums/role.enum';
import { AuthGuard } from '@nestjs/passport';
import { GetUserInfoParamDto } from '../dtos/get-user-info.param';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, } from '@nestjs/swagger';
import { GetUserInfoResponseDto } from '../dtos/get-user-info.response';
import { GetCurrentUserInfoResponseDto } from '../dtos/get-current-user-info.response';
import { UpdateUserInfoResponseDto } from '../dtos/update-user-info.response';

@Controller('/')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
@ApiTags('用户')
export class UserinfoController {
    constructor(private usersService: UsersService) {}

    @Put('/user')
    @Roles(Role.NormalUser, Role.RegisteredUser, Role.Admin)
    @ApiOperation({ summary: '更新当前用户信息' })
    @ApiOkResponse({
        description: '更新成功',
        type: UpdateUserInfoResponseDto,
    })
    async update(@Req() request, @Body() body: UpdateUserInfoBodyDto) {
        await this.usersService.updateUserinfoAndRole(
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
        type: GetUserInfoResponseDto,
    })
    async getInfo(@Param() param: GetUserInfoParamDto) {
        return await this.usersService.getUserInfoByID(param.id, false);
    }

    @Get('/user')
    @Roles(Role.NormalUser, Role.RegisteredUser, Role.Admin)
    @ApiOperation({ summary: '获取当前用户信息' })
    @ApiOkResponse({
        description: '获取成功',
        type: GetCurrentUserInfoResponseDto,
    })
    async getCurrentInfo(@Req() request) {
        return await this.usersService.getUserInfoByID(request.user.id, true);
    }
}
