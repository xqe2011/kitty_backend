import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/modules/user/enums/role.enum';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { RecommendationService } from './recommendation.service';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, } from '@nestjs/swagger';
import { GetUserRecommendationsResponseDto } from '../dtos/get-user-recommendations.response';
import { GetUserRecommendationsQueryDto } from '../dtos/get-user-recommendations.query';
import { HttpExceptionResponseDto } from 'src/docs/dtos/http-exception.response';

@Controller('/cats/recommendation')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
@ApiTags('猫咪')
export class RecommendationController {
    constructor(
        private recommendationService: RecommendationService
    ) {}

    @Get('/')
    @Roles(Role.NormalUser, Role.RegisteredUser, Role.Admin)
    @ApiOperation({ summary: '获取用户推荐列表' })
    @ApiOkResponse({
        description: '获取成功,返回简略的猫咪列表',
        type: GetUserRecommendationsResponseDto,
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: '当前用户和系统默认的推荐列表都不存在',
        type: HttpExceptionResponseDto
    })
    getUserRecommendations(@Req() request, @Query() query: GetUserRecommendationsQueryDto) {
        return this.recommendationService.getUserRecommandationCatsList(request.user.id, query.limit, query.start);
    }
}
