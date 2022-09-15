import { Body, Controller, Delete, Get, Param, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/modules/user/enums/role.enum';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, } from '@nestjs/swagger';
import { CommentService } from 'src/modules/comment/comment/comment.service';
import { GetCommentsResponseDto } from '../dtos/get-comments.response';
import { GetCommentsQueryDto } from '../dtos/get-comments.query';
import { UpdateCommentBodyDto } from '../dtos/update-comment.body';
import { UpdateCommentParamDto } from '../dtos/update-comment.param';
import { UpdateCommentResponseDto } from '../dtos/update-comment.response';
import { DeleteCommentResponseDto } from '../dtos/delete-comment.response';
import { DeleteCommentParamDto } from '../dtos/delete-comment.param';
import { ManageLogService } from '../manage-log/manage-log.service';
import { ManageLogType } from '../enums/manage-log-type.enum';

@Controller('/manage')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.Admin)
@ApiBearerAuth()
@ApiTags('管理')
export class CommentController {
    constructor(
        private commentService: CommentService,
        private manageLogService: ManageLogService
    ) { }

    @Get('comments')
    @ApiOperation({
        summary: '获取所有评论',
        description: '获取所有评论,需要管理员权限'
    })
    @ApiOkResponse({
        description: '获取成功',
        type: GetCommentsResponseDto,
        isArray: true
    })
    async getPhotos(@Query() query: GetCommentsQueryDto) {
        return await this.commentService.getComments(query.limit, query.start);
    }

    @Put('comment/:id')
    @ApiOperation({
        summary: '修改评论信息',
        description: '修改评论信息,需要管理员权限'
    })
    @ApiOkResponse({
        description: '修改成功',
        type: UpdateCommentResponseDto
    })
    async updateComment(@Req() request, @Param() param: UpdateCommentParamDto, @Body() body: UpdateCommentBodyDto) {
        await this.commentService.updateCommentInfo(param.id, body.status);
        await this.manageLogService.writeLog(request.user.id, ManageLogType.UPDATE_COMMENT, { ...param, ...body });
        return {};
    }

    @Delete('comment/:id')
    @ApiOperation({
        summary: '删除评论',
        description: '删除评论,需要管理员权限'
    })
    @ApiOkResponse({
        description: '删除成功',
        type: DeleteCommentResponseDto
    })
    async deleteComment(@Req() request, @Param() param: DeleteCommentParamDto) {
        await this.commentService.deleteComment(param.id);
        await this.manageLogService.writeLog(request.user.id, ManageLogType.DELETE_COMMENT, { ...param });
        return {};
    }
}
