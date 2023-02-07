import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { Role } from 'src/modules/user/enums/role.enum';
import { CreateReportBodyDto } from '../dtos/create-report.body';
import { CreateReportResponseDto } from '../dtos/create-report.response';
import { GetReportsQueryDto } from '../dtos/get-reports.query';
import { GetReportsResponseDto } from '../dtos/get-reports.response';
import { ReportService } from './report.service';

@Controller('reports')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
@ApiTags('举报')
export class ReportController {
    constructor(
        private reportService: ReportService
    ) {}

    @Post('/')
    @Roles(Role.Admin, Role.RegisteredUser)
    @ApiOperation({
        summary: '发布举报',
        description: '发布举报,需要注册用户权限',
    })
    @ApiOkResponse({
        description: '发布成功',
        type: CreateReportResponseDto,
    })
    async createReport(@Req() request, @Body() body: CreateReportBodyDto) {
        return {
            reportID: await this.reportService.createReport(
                request.user.id,
                body.entityType,
                body.entityID,
                body.type,
                body.content
            )
        };
    }

    @Get('/')
    @ApiOperation({
        summary: '获取举报列表',
        description: '获取用户提交的举报列表,需要注册用户权限'
    })
    @ApiOkResponse({
        description: '获取成功',
        type: GetReportsResponseDto,
        isArray: true
    })
    @Roles(Role.Admin, Role.RegisteredUser)
    async getReports(@Req() request, @Query() query: GetReportsQueryDto) {
        return await this.reportService.getReportsByUserID(request.user.id, query.limit, query.start);
    }
}
