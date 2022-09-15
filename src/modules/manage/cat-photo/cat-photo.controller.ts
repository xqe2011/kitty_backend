import { Body, Controller, Delete, Get, Param, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/modules/user/enums/role.enum';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, } from '@nestjs/swagger';
import { PhotoService } from 'src/modules/cat/photo/photo.service';
import { GetCatsPhotosQueryDto } from '../dtos/get-cats-photos.query';
import { GetCatsPhotosResponseDto } from '../dtos/get-cats-photos.response';
import { UpdateCatPhotoResponseDto } from '../dtos/update-cat-photo.response';
import { UpdateCatPhotoParamDto } from '../dtos/update-cat-photo.param';
import { UpdateCatPhotoBodyDto } from '../dtos/update-cat-photo.body';
import { DeleteCatPhotoResponseDto } from '../dtos/delete-cat-photo.response';
import { DeleteCatPhotoParamDto } from '../dtos/delete-cat-photo.param';
import { ManageLogService } from '../manage-log/manage-log.service';
import { ManageLogType } from '../enums/manage-log-type.enum';

@Controller('/manage')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.Admin, Role.RegisteredUser)
@ApiBearerAuth()
@ApiTags('管理')
export class CatPhotoController {
    constructor(
        private photoService: PhotoService,
        private manageLogService: ManageLogService
    ) { }

    @Get('cats/photos')
    @ApiOperation({
        summary: '获取所有猫咪照片',
        description: '获取所有猫咪照片,需要管理员权限'
    })
    @ApiOkResponse({
        description: '获取成功',
        type: GetCatsPhotosResponseDto,
        isArray: true
    })
    async getPhotos(@Query() query: GetCatsPhotosQueryDto) {
        return await this.photoService.getPhotos(query.limit, query.start);
    }

    @Put('cats/photo/:id')
    @ApiOperation({
        summary: '修改猫咪照片信息',
        description: '修改猫咪照片信息,需要管理员权限'
    })
    @ApiOkResponse({
        description: '修改成功',
        type: UpdateCatPhotoResponseDto
    })
    async updatePhoto(@Req() request, @Param() param: UpdateCatPhotoParamDto, @Body() body: UpdateCatPhotoBodyDto) {
        await this.photoService.updatePhotoInfo(param.id, body.type);
        await this.manageLogService.writeLog(request.user.id, ManageLogType.UPDATE_CAT_PHOTO, { ...param, ...body });
        return {};
    }

    @Delete('cats/photo/:id')
    @ApiOperation({
        summary: '删除猫咪照片',
        description: '删除猫咪照片,需要管理员权限'
    })
    @ApiOkResponse({
        description: '删除成功',
        type: DeleteCatPhotoResponseDto
    })
    async deletePhoto(@Req() request, @Param() param: DeleteCatPhotoParamDto) {
        await this.photoService.deletePhoto(param.id);
        await this.manageLogService.writeLog(request.user.id, ManageLogType.DELETE_CAT_PHOTO, { ...param });
        return {};
    }
}
