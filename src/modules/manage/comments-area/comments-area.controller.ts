import { Body, Controller, Param, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/modules/user/enums/role.enum';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, } from '@nestjs/swagger';
import { CommentsAreaService } from 'src/modules/comment/comments-area/comments-area.service';
import { UpdateCommentsAreaResponseDto } from '../dtos/update-comments-area.response';
import { UpdateCommentsAreaParamDto } from '../dtos/update-comments-area.param';
import { UpdateCommentsAreaBodyDto } from '../dtos/update-comments-area.body';

@Controller('/manage')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.Admin)
@ApiBearerAuth()
@ApiTags('管理')
export class CommentsAreaController {
    constructor(
        private commentsAreaService: CommentsAreaService
    ) { }

    @Put('comments_area/:id')
    @ApiOperation({
        summary: '修改评论区信息',
        description: '修改评论区信息,需要管理员权限'
    })
    @ApiOkResponse({
        description: '修改成功',
        type: UpdateCommentsAreaResponseDto
    })
    async updateComment(@Param() param: UpdateCommentsAreaParamDto, @Body() body: UpdateCommentsAreaBodyDto) {
        await this.commentsAreaService.updateAreaInfo(param.id, body.isDisplay);
        return {};
    }
}
