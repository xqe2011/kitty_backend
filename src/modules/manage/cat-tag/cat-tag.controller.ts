import { Body, Controller, Delete, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/modules/user/enums/role.enum';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnprocessableEntityResponse, } from '@nestjs/swagger';
import { ManageLogService } from '../manage-log/manage-log.service';
import { ManageLogType } from '../enums/manage-log-type.enum';
import { TagService } from 'src/modules/cat/tag/tag/tag.service';
import { AddTagToCatParamDto } from '../dtos/add-tag-to-cat.param';
import { AddTagToCatBodyDto } from '../dtos/add-tag-to-cat.body';
import { AddTagToCatResponseDto } from '../dtos/add-tag-to-cat.response';
import { DeleteCatTagParamDto } from '../dtos/delete-cat-tag.param';
import { DeleteCatTagResponseDto } from '../dtos/delete-cat-tag.response';
import { ApiExceptionResponseDto } from 'src/docs/dtos/api-exception.response';

@Controller('/manage')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.Admin)
@ApiBearerAuth()
@ApiTags('管理')
export class CatTagController {
    constructor(
        private tagService: TagService,
        private manageLogService: ManageLogService
    ) { }

    @Post('cat/:id/tags')
    @ApiOperation({
        summary: '添加标签到猫咪',
        description: '添加标签到猫咪,需要管理员权限'
    })
    @ApiOkResponse({
        description: '添加成功',
        type: AddTagToCatResponseDto
    })
    @ApiUnprocessableEntityResponse({
        description: "业务错误,请查阅业务错误代码列表",
        type: ApiExceptionResponseDto
    })
    async addTagToCat(@Req() request, @Param() param: AddTagToCatParamDto, @Body() body: AddTagToCatBodyDto) {
        const data = { id: await this.tagService.addTag(param.id, body.name) };
        await this.manageLogService.writeLog(request.user.id, ManageLogType.ADD_TAG_TO_CAT, { ...param, ...body, ...data });
        return data;
    }

    @Delete('cats/tag/:id')
    @ApiOperation({
        summary: '删除猫咪TAG',
        description: '删除猫咪TAG,需要管理员权限'
    })
    @ApiOkResponse({
        description: '删除成功',
        type: DeleteCatTagResponseDto
    })
    async deleteTag(@Req() request, @Param() param: DeleteCatTagParamDto) {
        await this.tagService.deleteTag(param.id);
        await this.manageLogService.writeLog(request.user.id, ManageLogType.DELETE_CAT_TAG, { ...param });
        return {};
    }
}
