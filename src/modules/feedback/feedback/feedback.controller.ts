import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { Role } from 'src/modules/user/enums/role.enum';
import { CreateFeedbackBodyDto } from '../dtos/create-feedback.body';
import { CreateFeedbackResponseDto } from '../dtos/create-feedback.response';
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
    @ApiOperation({ summary: '发布反馈' })
    @ApiOkResponse({
        description: '发布成功',
        type: CreateFeedbackResponseDto,
    })
    async uploadPhoto(@Req() request, @Body() body: CreateFeedbackBodyDto) {
        await this.feedbackService.createFeedback(
            body.type,
            body.type == FeedbackType.CAT ? body.catID : undefined,
            request.user.id,
            body.content,
            body.fileTokens
        );
        return {};
    }
}
