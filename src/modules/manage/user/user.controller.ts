import { Body, Controller, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/modules/user/enums/role.enum';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, } from '@nestjs/swagger';
import { UserService } from 'src/modules/user/user/user.service';
import { GetUserInfoParamDto } from '../dtos/get-user-info.param';
import { GetUserInfoResponseDto } from '../dtos/get-user-info.response';
import { UpdateUserResponseDto } from '../dtos/update-user.response';
import { UpdateUserBodyDto } from '../dtos/update-user.body';
import { UpdateUserParamDto } from '../dtos/update-user.param';
import { ChangeUserPointsResponseDto } from '../dtos/change-user-points.response';
import { ChangeUserPointsParamDto } from '../dtos/change-user-points.param';
import { ChangeUserPointsBodyDto } from '../dtos/change-user-points.body';
import { PointsService } from 'src/modules/user/points/points.service';
import { PointsTransactionReason } from 'src/modules/user/enums/points-transaction-reason.enum';
import { ManageLogService } from '../manage-log/manage-log.service';
import { ManageLogType } from '../enums/manage-log-type.enum';
import { ResetUserResponseDto } from '../dtos/reset-user.response';
import { ResetUserParamDto } from '../dtos/reset-user.param';

@Controller('/manage')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.Admin, Role.RegisteredUser)
@ApiBearerAuth()
@ApiTags('管理')
export class UserController {
    constructor(
        private userService: UserService,
        private pointsService: PointsService,
        private manageLogService: ManageLogService
    ) { }

    @Get('user/:id')
    @ApiOperation({
        summary: '获取用户详细信息',
        description: '获取用户详细信息,需要管理员权限'
    })
    @ApiOkResponse({
        description: '获取用户详细信息成功',
        type: GetUserInfoResponseDto
    })
    async getUserInfo(@Param() param: GetUserInfoParamDto) {
        return await this.userService.getUserInfoByID(param.id, true);
    }

    @Post('user/:id/reset')
    @ApiOperation({
        summary: '重置用户昵称和头像',
        description: '重置用户昵称和头像,需要管理员权限'
    })
    @ApiOkResponse({
        description: '重置用户昵称和头像成功',
        type: ResetUserResponseDto
    })
    async resetUser(@Request() request, @Param() param: ResetUserParamDto) {
        await this.manageLogService.writeLog(request.user.id, ManageLogType.RESET_USER, { ...param });
        await this.userService.resetNickNameAndAvatar(param.id);
        return {};
    }

    @Put('user/:id')
    @ApiOperation({
        summary: '更新用户信息',
        description: '更新用户信息,需要管理员权限'
    })
    @ApiOkResponse({
        description: '获取用户信息成功',
        type: UpdateUserResponseDto
    })
    async updateUserInfo(@Request() request, @Param() param: UpdateUserParamDto, @Body() body: UpdateUserBodyDto) {
        await this.manageLogService.writeLog(request.user.id, ManageLogType.UPDATE_USER, { ...param, ...body });
        await this.userService.updateUser(param.id, body.role);
        return {};
    }

    @Post('user/:id/points')
    @ApiOperation({
        summary: '修改用户积分',
        description: '修改用户积分,需要管理员权限'
    })
    @ApiOkResponse({
        description: '修改用户积分成功',
        type: ChangeUserPointsResponseDto
    })
    async changeUserPoints(@Request() request, @Param() param: ChangeUserPointsParamDto, @Body() body: ChangeUserPointsBodyDto) {
        await this.manageLogService.writeLog(request.user.id, ManageLogType.CHANGE_USER_POINTS, { ...param, ...body });
        await this.pointsService.changePoints(param.id, body.points, PointsTransactionReason.ADMIN, body.reason);
        return {};
    }

}
