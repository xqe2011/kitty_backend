import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/modules/user/enums/role.enum';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { CommentsAreaService } from './comments-area.service';
import { GetCommentAreaInfoParamDto } from '../dtos/get-comment-area-info.param';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetCommentAreaInfoResponseDto } from '../dtos/get-comment-area-info.response';

@Controller('/')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
@ApiTags('评论')
export class CommentsAreaController {
    constructor(private commentsAreaRepository: CommentsAreaService) {}

    @Get('/comments_area/:id')
    @Roles(Role.NormalUser, Role.RegisteredUser, Role.Admin)
    @ApiOperation({ summary: '获取评论区状态信息' })
    @ApiOkResponse({
        description: '获取成功',
        type: GetCommentAreaInfoResponseDto,
    })
    async getAreaInfoByID(@Param() param: GetCommentAreaInfoParamDto) {
        return await this.commentsAreaRepository.getAreaInfoByID(param.id);
    }
}
