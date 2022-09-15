import { Body, Controller, Get, Param, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/modules/user/enums/role.enum';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, } from '@nestjs/swagger';
import { FeedbackService } from 'src/modules/feedback/feedback/feedback.service';
import { SearchFeedbacksResponseDto } from '../dtos/search-feedbacks.response';
import { SearchFeedbacksQueryDto } from '../dtos/search-feedbacks.query';
import { UpdateFeedbackResponseDto } from '../dtos/update-feedback.response';
import { UpdateFeedbackParamDto } from '../dtos/update-feedback.param';
import { UpdateFeedbackBodyDto } from '../dtos/update-feedback.body';
import { ManageLogService } from '../manage-log/manage-log.service';
import { ManageLogType } from '../enums/manage-log-type.enum';

@Controller('/manage')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.Admin)
@ApiBearerAuth()
@ApiTags('管理')
export class FeedbackController {
    constructor(
        private feedbackService: FeedbackService,
        private manageLogService: ManageLogService
    ) { }

    @Get('feedbacks')
    @ApiOperation({
        summary: '搜索反馈',
        description: '搜索反馈,需要管理员权限'
    })
    @ApiOkResponse({
        description: '搜索成功',
        type: SearchFeedbacksResponseDto,
        isArray: true
    })
    async searchFeedbacks(@Query() query: SearchFeedbacksQueryDto) {
        return await this.feedbackService.searchFeedbacks(query.userID, query.progress, query.type, query.limit, query.start, query.photoLimit);
    }

    @Put('feedback/:id')
    @ApiOperation({
        summary: '修改反馈信息',
        description: '修改反馈信息,需要管理员权限'
    })
    @ApiOkResponse({
        description: '修改成功',
        type: UpdateFeedbackResponseDto
    })
    async updateFeedback(@Req() request, @Param() param: UpdateFeedbackParamDto, @Body() body: UpdateFeedbackBodyDto) {
        await this.feedbackService.updateFeedbackInfo(param.id, body.type, body.progress);
        await this.manageLogService.writeLog(request.user.id, ManageLogType.UPDATE_FEEDBACK, { ...param, ...body });
        return {};
    }
}
