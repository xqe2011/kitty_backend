import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/modules/user/enums/role.enum';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, } from '@nestjs/swagger';
import { ReportService } from 'src/modules/report/report/report.service';
import { GetReportsByEntityQueryDto } from '../dtos/get-reports-by-entity.query';
import { GetReportsByEntityResponseDto } from '../dtos/get-reports-by-entity.response';
import { GetEntitiesExceedReportThresholdResponseDto } from '../dtos/get-entities-exceed-report-threshold.response';
import { GetEntitiesExceedReportThresholdQueryDto } from '../dtos/get-entities-exceed-report-threshold.query';

@Controller('/manage')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.Admin)
@ApiBearerAuth()
@ApiTags('管理')
export class ReportController {
    constructor(
        private reportService: ReportService
    ) { }

    @Get('reports')
    @ApiOperation({
        summary: '获取举报列表',
        description: '获取指定实体的反馈列表,需要管理员权限'
    })
    @ApiOkResponse({
        description: '获取成功',
        type: GetReportsByEntityResponseDto,
        isArray: true
    })
    async getReportsByEntity(@Query() query: GetReportsByEntityQueryDto) {
        return await this.reportService.getReportsByEntity(query.entityType, query.entityID, query.limit, query.start);
    }

    @Get('reports/entities')
    @ApiOperation({
        summary: '获取超过举报阈值的实体列表',
        description: '获取超过举报阈值的实体列表,需要管理员权限'
    })
    @ApiOkResponse({
        description: '获取成功',
        type: GetEntitiesExceedReportThresholdResponseDto,
        isArray: true
    })
    async getEntitiesExceedReportThreshold(@Query() query: GetEntitiesExceedReportThresholdQueryDto) {
        return await this.reportService.getEntitiesExceedReportThreshold(query.entityType, query.limit, query.start);
    }
}
