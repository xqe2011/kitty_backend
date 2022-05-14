import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, } from '@nestjs/swagger';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { GetAchievementsResponseDto } from '../dtos/get-achievements.response';
import { Role } from '../enums/role.enum';
import { AchievementService } from './achievement.service';

@Controller('user/achievements')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
@ApiTags('用户')
export class AchievementController {
    constructor(private achievementService: AchievementService) {}

    @Get('/')
    @Roles(Role.NormalUser, Role.RegisteredUser, Role.Admin)
    @ApiOperation({ summary: '获取当前用户成就列表' })
    @ApiOkResponse({
        description: '获取成功',
        type: GetAchievementsResponseDto,
        isArray: true,
    })
    async getAchievements(@Req() request) {
        return await this.achievementService.getUserAchievements(request.user.id);
    }
}
