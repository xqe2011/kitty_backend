import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/modules/user/enums/role.enum';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { LikeableEntityService } from './likeable-entity.service';
import { GetLikeableEntityInfoParamDto } from '../dtos/get-likeable-entity-info.param';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { GetLikeableEntityResponseDto } from '../dtos/get-likeable-entity-info.response';
import { CancelLikeResponseDto } from '../dtos/cancel-like.response';
import { CancelLikeParamDto } from '../dtos/cancel-like.param';
import { SetLikeResponseDto } from '../dtos/set-like.response';
import { SetLikeParamDto } from '../dtos/set-like.param';
import { ApiExceptionResponseDto } from 'src/docs/dtos/api-exception.response';

@Controller('/')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
@ApiTags('点赞')
export class LikeableEntityController {
    constructor(private likeableEntityService: LikeableEntityService) {}

    @Get('/likeable_entity/:id')
    @Roles(Role.NormalUser, Role.RegisteredUser, Role.Admin)
    @ApiOperation({ summary: '获取点赞实体信息' })
    @ApiOkResponse({
        description: '获取成功',
        type: GetLikeableEntityResponseDto,
    })
    async getLikeableEntityInfoByID(@Req() request, @Param() param: GetLikeableEntityInfoParamDto) {
        return await this.likeableEntityService.getLikeableEntityInfoByID(request.user.id, param.id);
    }

    @Post('/likeable_entity/:id/like')
    @Roles(Role.NormalUser, Role.RegisteredUser, Role.Admin)
    @ApiOperation({ summary: '点赞' })
    @ApiOkResponse({
        description: '点赞成功',
        type: SetLikeResponseDto,
    })
    @ApiUnprocessableEntityResponse({
        description: "业务错误,请查阅业务错误代码列表",
        type: ApiExceptionResponseDto
    })
    async setLike(@Req() request, @Param() param: SetLikeParamDto) {
        await this.likeableEntityService.like(request.user.id, param.id);
        return {};
    }

    @Post('/likeable_entity/:id/cancel_like')
    @Roles(Role.NormalUser, Role.RegisteredUser, Role.Admin)
    @ApiOperation({ summary: '取消点赞' })
    @ApiOkResponse({
        description: '取消点赞成功',
        type: CancelLikeResponseDto,
    })
    async cancelLike(@Req() request, @Param() param: CancelLikeParamDto) {
        await this.likeableEntityService.cancelLike(request.user.id, param.id);
        return {};
    }
}
