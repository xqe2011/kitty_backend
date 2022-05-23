import { Get, Body, Controller, Post, Req, UseGuards, Param } from '@nestjs/common';
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

@Controller('/cats')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
@ApiTags('猫咪')
export class PhotoController {
    constructor(private photoService: PhotoService) {}

    @Post('/photos')
    @Roles(Role.Admin, Role.RegisteredUser)
    @ApiOperation({ summary: '发布猫咪随手拍' })
    @ApiOkResponse({
        description: '发布成功',
        type: UploadPhotoResponseDto,
    })
    @ApiConflictResponse({ description: '该照片已经发布过' })
    async uploadPhoto(@Req() request, @Body() body: UploadPhotoBodyDto) {
        await this.photoService.createUserPhoto(
            request.user.id,
            body.catID,
            body.fileToken,
            body.comment,
            body.compassAngle,
            body.latitude,
            body.longitude,
            body.positionAccuration,
        );
        return {};
    }

    @Get('/:id/photos/other')
    @Roles(Role.Admin, Role.RegisteredUser)
    @ApiOperation({ summary: '获取用户发布的猫咪照片' })
    @ApiOkResponse({
        description: '获取成功',
        type: GetOtherPhotosResponseDto,
    })
    async getOtherPhotos(@Param() param: GetOtherPhotosParamDto) {
        return await this.photoService.getPhotosByCatIDAndType(param.id, CatPhotoType.OTHERS);
    }
}
