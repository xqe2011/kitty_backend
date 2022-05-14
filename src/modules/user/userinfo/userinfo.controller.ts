import { Body, Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { UpdateUserInfoInputDto } from '../dtos/update-user-info.input';
import { UsersService } from '../user/users.service';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { Role } from 'src/modules/user/enums/role.enum';
import { AuthGuard } from '@nestjs/passport';
import { GetUserInfoParamDto } from '../dtos/get-user-info.param';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, } from '@nestjs/swagger';
import { UpdateUserInfoOutputDto } from '../dtos/update-user-info.output';
import { GetUserInfoResponseDto } from '../dtos/get-user-info.output';

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
        type: UpdateUserInfoOutputDto,
    })
    async update(@Req() request, @Body() body: UpdateUserInfoInputDto) {
        await this.usersService.updateUserinfoAndRole(
            request.user.id,
            body.nickName,
            body.avatarFileToken,
        );
        return {};
    }

    @Get('/users/:id')
    @Roles(Role.NormalUser, Role.RegisteredUser, Role.Admin)
    @ApiOperation({ summary: '获取用户信息' })
    @ApiOkResponse({
        description: '获取成功',
        type: GetUserInfoResponseDto,
    })
    async getInfo(@Req() request, @Param() body: GetUserInfoParamDto) {
        return await this.usersService.getUserInfoByID(
            body.id === null ? request.user.id : body.id,
            body.id === null,
        );
    }
}
