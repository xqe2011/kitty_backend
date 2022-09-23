import { Body, Controller, Delete, ForbiddenException, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/modules/user/enums/role.enum';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { CommentService } from './comment.service';
import { DeleteCommentParamDto } from '../dtos/delete-comment.param';
import { GetCommentsByAreaIDQueryDto } from '../dtos/get-comments-by-area-id.query';
import { CreateCommentBodyDto } from '../dtos/create-comment.body';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateCommentResponseDto } from '../dtos/create-comment.response';
import { GetCommentsByAreaIDResponseDto } from '../dtos/get-comments-by-area-id.response';
import { DeleteCommentResponseDto } from '../dtos/delete-comment.response';
import { GetCommentsByAreaIDParamDto } from '../dtos/get-comments-by-area-id.param';
import { GetCommentsByParentIDResponseDto } from '../dtos/get-comments-by-parent-id.response';
import { GetCommentsByParentIDParamDto } from '../dtos/get-comments-by-parent-id.param';
import { GetCommentsByParentIDQueryDto } from '../dtos/get-comments-by-parent-id.query';
import { GetCommentsByConversationIDResponseDto } from '../dtos/get-comments-by-conversation-id.response';
import { GetCommentsByConversationIDQueryDto } from '../dtos/get-comments-by-conversation-id.query';
import { GetCommentsByConversationIDParamDto } from '../dtos/get-comments-by-conversation-id.param';

@Controller('/')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
@ApiTags('评论')
export class CommentController {
    constructor(private commentService: CommentService) {}

    @Post('comments')
    @Roles(Role.RegisteredUser, Role.Admin)
    @ApiOperation({
        summary: '发表评论',
        description: '发表评论,需要注册用户权限',
    })
    @ApiCreatedResponse({
        description: '发表成功',
        type: CreateCommentResponseDto,
    })
    async createComment(@Req() request, @Body() body: CreateCommentBodyDto) {
        return {
            commentID: await this.commentService.createComment(
                request.user.id,
                body.areaID,
                body.parentID,
                body.conversationID,
                body.content,
            )
        };
    }

    @Get('comments/by-area/:id')
    @Roles(Role.NormalUser, Role.RegisteredUser, Role.Admin)
    @ApiOperation({ summary: '通过评论区ID获取评论列表' })
    @ApiOkResponse({
        description: '获取成功',
        type: GetCommentsByAreaIDResponseDto,
    })
    async getCommentsByAreaID(@Param() param: GetCommentsByAreaIDParamDto, @Query() query: GetCommentsByAreaIDQueryDto) {
        return await this.commentService.getCommentsByAreaID(param.id, query.rootLimit, query.rootStart, query.childrenLimit);
    }

    @Get('comments/by-parent/:id')
    @Roles(Role.NormalUser, Role.RegisteredUser, Role.Admin)
    @ApiOperation({
        summary: '通过父评论ID获取评论列表',
        description: '通过一级评论ID获取对应的子评论列表'
    })
    @ApiOkResponse({
        description: '获取成功',
        type: GetCommentsByParentIDResponseDto,
        isArray: true
    })
    async getCommentsByParentID(@Param() param: GetCommentsByParentIDParamDto, @Query() query: GetCommentsByParentIDQueryDto) {
        return await this.commentService.getCommentsByParentID(param.id, query.limit, query.start);
    }

    @Get('comments/by-conversation/:id')
    @Roles(Role.NormalUser, Role.RegisteredUser, Role.Admin)
    @ApiOperation({ summary: '通过讨论ID获取评论列表' })
    @ApiOkResponse({
        description: '获取成功',
        type: GetCommentsByConversationIDResponseDto,
        isArray: true
    })
    async getCommentsByConversationID(@Param() param: GetCommentsByConversationIDParamDto, @Query() query: GetCommentsByConversationIDQueryDto) {
        return await this.commentService.getCommentsByConversationID(param.id, query.limit, query.start);
    }

    @Delete('comment/:id')
    @Roles(Role.RegisteredUser, Role.Admin)
    @ApiOperation({
        summary: '删除评论',
        description: '删除评论,需要注册用户权限',
    })
    @ApiOkResponse({
        description: '删除成功',
        type: DeleteCommentResponseDto,
    })
    async deleteComment(@Req() request, @Param() param: DeleteCommentParamDto) {
        if (!(await this.commentService.isCommentBelongToUser(param.id, request.user.id))) {
            throw new ForbiddenException('This comment is not belong to you.');
        }
        await this.commentService.deleteComments(param.id);
        return {};
    }
}
