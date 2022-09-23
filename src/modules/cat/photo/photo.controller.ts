import { Get, Body, Controller, Post, Req, UseGuards, Param, Query, Delete, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { Role } from 'src/modules/user/enums/role.enum';
import { PhotoService } from './photo.service';
import { UploadPhotoBodyDto } from '../dtos/upload-photo.body';
import { ApiBearerAuth, ApiConflictResponse, ApiOkResponse, ApiOperation, ApiTags, } from '@nestjs/swagger';
import { GetOtherPhotosResponseDto } from '../dtos/get-other-photos.response';
import { GetOtherPhotosParamDto } from '../dtos/get-other-photos.param';
import { UploadPhotoResponseDto } from '../dtos/upload-photo.response';
import { CatPhotoType } from '../enums/cat-photo-type.enum';
import { GetOtherPhotosQueryDto } from '../dtos/get-other-photos.query';
import { DeleteCatPhotoResponseDto } from '../dtos/delete-cat-photo.response';
import { DeleteCatPhotoParamDto } from '../dtos/delete-cat-photo.param';

@Controller('/')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
@ApiTags('猫咪')
export class PhotoController {
    constructor(
        private photoService: PhotoService
    ) {}

    @Post('/cats/photos')
    @Roles(Role.Admin, Role.RegisteredUser)
    @ApiOperation({
        summary: '发布猫咪随手拍',
        description: '发布猫咪随手拍,需要注册用户权限'
    })
    @ApiOkResponse({
        description: '发布成功',
        type: UploadPhotoResponseDto,
    })
    @ApiConflictResponse({ description: '该照片已经发布过' })
    async uploadPhoto(@Req() request, @Body() body: UploadPhotoBodyDto) {
        return {
            photoID: await this.photoService.createUserPhoto(
                request.user.id,
                body.catID,
                body.fileToken,
                body.comment,
                body.compassAngle,
                body.latitude,
                body.longitude,
                body.positionAccuration,
            )
        };
    }

    @Get('/cat/:id/photos/other')
    @Roles(Role.Admin, Role.RegisteredUser, Role.NormalUser)
    @ApiOperation({
        summary: '获取其他类型的猫咪照片',
        description: "获取除了封面和精选照片以外的照片,即其他用户发布的照片,按照时间倒序返回"
    })
    @ApiOkResponse({
        description: '获取成功',
        type: GetOtherPhotosResponseDto,
        isArray: true
    })
    async getOtherPhotos(@Param() param: GetOtherPhotosParamDto, @Query() query: GetOtherPhotosQueryDto) {
        return await this.photoService.getPhotosByCatIDAndType(param.id, CatPhotoType.OTHERS, query.limit, query.start);
    }

    @Delete('/cats/photo/:id')
    @Roles(Role.Admin, Role.RegisteredUser)
    @ApiOperation({
        summary: '删除猫咪照片',
        description: '删除猫咪照片,需要注册用户权限'
    })
    @ApiOkResponse({
        description: '删除成功',
        type: DeleteCatPhotoResponseDto
    })
    async deletePhoto(@Req() request, @Param() param: DeleteCatPhotoParamDto) {
        if (!(await this.photoService.isPhotoBelongToUser(param.id, request.user.id))) {
            throw new ForbiddenException('This photo is not belong to you.');
        }
        await this.photoService.deletePhoto(param.id);
        return {};
    }
}
