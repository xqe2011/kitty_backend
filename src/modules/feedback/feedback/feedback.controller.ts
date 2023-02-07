import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { Role } from 'src/modules/user/enums/role.enum';
import { CreateFeedbackBodyDto } from '../dtos/create-feedback.body';
import { CreateFeedbackResponseDto } from '../dtos/create-feedback.response';
import { GetFeedbacksQueryDto } from '../dtos/get-feedbacks.query';
import { GetFeedbacksResponseDto } from '../dtos/get-feedbacks.response';
import { FeedbackType } from '../enums/feedback-type.enum';
import { FeedbackService } from './feedback.service';

@Controller('feedbacks')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
@ApiTags('反馈')
export class FeedbackController {
    constructor(
        private feedbackService: FeedbackService
    ) {}

    @Post('/')
    @Roles(Role.Admin, Role.RegisteredUser)
    @ApiOperation({ summary: '发布反馈,需要注册用户权限' })
    @ApiOkResponse({
        description: '发布成功',
        type: CreateFeedbackResponseDto,
    })
    async createFeedback(@Req() request, @Body() body: CreateFeedbackBodyDto) {
        return {
            feedbackID: await this.feedbackService.createFeedback(
                body.type,
                body.type == FeedbackType.CAT ? body.catID : undefined,
                request.user.id,
                body.content,
                body.fileTokens
            )
        };
    }

    @Get('/')
    @ApiOperation({
        summary: '获取反馈',
        description: '获取用户提交的反馈'
    })
    @ApiOkResponse({
        description: '获取成功',
        type: GetFeedbacksResponseDto,
        isArray: true
    })
    async getFeedbacks(@Req() request, @Query() query: GetFeedbacksQueryDto) {
        return await this.feedbackService.searchFeedbacks(request.user.id, undefined, undefined, query.limit, query.start, query.photoLimit);
    }
}
