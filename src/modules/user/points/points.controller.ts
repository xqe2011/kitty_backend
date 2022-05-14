import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { Role } from '../enums/role.enum';
import { GetRankingQueryDto } from '../dtos/get-rankings.query';
import { GetTransactionQueryDto } from '../dtos/get-transactions.query';
import { PointsService } from './points.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, } from '@nestjs/swagger';
import { GetRankingResponseDto } from '../dtos/get-rankings.response';
import { GetTransactionResponseDto } from '../dtos/get-transactions.response';

@Controller('user/points')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
@ApiTags('用户')
export class PointsController {
    constructor(private pointsService: PointsService) {}

    @Get('rankings')
    @Roles(Role.NormalUser, Role.RegisteredUser, Role.Admin)
    @ApiOperation({ summary: '获取积分降序排行榜' })
    @ApiOkResponse({
        description: '获取成功',
        type: GetRankingResponseDto,
        isArray: true,
    })
    getRankings(@Query() query: GetRankingQueryDto) {
        return this.pointsService.getPointsRankingInDescending(query.limit, query.start);
    }

    @Get('transactions')
    @Roles(Role.RegisteredUser, Role.Admin)
    @ApiOperation({
        summary: '获取当前用户积分记录',
        description: '获取积分记录,需要注册用户权限',
    })
    @ApiOkResponse({
        description: '获取成功',
        type: GetTransactionResponseDto,
        isArray: true,
    })
    getTransactions(@Req() request, @Query() query: GetTransactionQueryDto) {
        return this.pointsService.getPointsTransaction(request.user.id, query.limit, query.start);
    }
}
