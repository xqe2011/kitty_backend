import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/modules/user/enums/role.enum';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { FileService } from './file.service';
import { CreateUploadParamsBodyDto } from '../dtos/create-upload-params.param';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, } from '@nestjs/swagger';
import { CreateUploadParamsResponseDto } from '../dtos/create-upload-params.response';

@Controller('files')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
@ApiTags('文件管理')
export class FileController {
    constructor(private fileService: FileService) { }

    @Post('/')
    @Roles(Role.NormalUser, Role.RegisteredUser, Role.Admin)
    @ApiOperation({
        summary: '上传文件',
        description: '获取可用于上次一个文件的上传文件地址和参数',
    })
    @ApiOkResponse({
        description: '获取成功',
        type: CreateUploadParamsResponseDto,
    })
    async createUploadParams(
        @Req() request,
        @Body() body: CreateUploadParamsBodyDto,
    ) {
        return await this.fileService.createUploadParams(
            request.user.id,
            body.type,
            body.extName,
        );
    }
}
