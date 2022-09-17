import { Body, Controller, Param, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/modules/user/enums/role.enum';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateLikeableEntityResponseDto } from '../dtos/update-likeable-entity.response';
import { UpdateLikeableEntityParamDto } from '../dtos/update-likeable-entity.param';
import { UpdateLikeableEntityBodyDto } from '../dtos/update-likeable-entity.body';
import { LikeableEntityService } from 'src/modules/like/likeable-entity/likeable-entity.service';
import { ManageLogService } from '../manage-log/manage-log.service';
import { ManageLogType } from '../enums/manage-log-type.enum';

@Controller('/manage')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.Admin)
@ApiBearerAuth()
@ApiTags('管理')
export class LikeableEntityController {
    constructor(
        private likeableEntityService: LikeableEntityService,
        private manageLogService: ManageLogService
    ) {}

    @Put('feedback/:id')
    @ApiOperation({
        summary: '修改点赞实体信息',
        description: '修改点赞实体信息,需要管理员权限'
    })
    @ApiOkResponse({
        description: '修改成功',
        type: UpdateLikeableEntityResponseDto
    })
    async updateLikeableEntity(@Req() request, @Param() param: UpdateLikeableEntityParamDto, @Body() body: UpdateLikeableEntityBodyDto) {
        await this.likeableEntityService.updateEntityInfo(param.id, body.isDisplay, body.allowDuplicateLike);
        await this.manageLogService.writeLog(request.user.id, ManageLogType.UPDATE_LIKEABLE_ENTITY, { ...param, ...body });
        return {};
    }
}
