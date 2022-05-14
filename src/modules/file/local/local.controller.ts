import { BadRequestException, Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LocalService } from './local.service';
import { UploadLocalBodyDto } from '../dtos/upload-local.body';
import { ApiConflictResponse, ApiConsumes, ApiCreatedResponse, ApiOperation, ApiTags, getSchemaPath, } from '@nestjs/swagger';
import { UploadLocalResponseDto } from '../dtos/upload-local.response';
import { HttpExceptionOutputDto } from 'src/docs/dtos/http-exception.output';

@Controller('files/local')
@ApiTags('文件管理')
export class LocalController {
    constructor(private localService: LocalService) { }

    @Post('/')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({
        summary: '上传文件到本地',
        description: '上传文件到本地,一般情况前端无需显式调用',
    })
    @ApiCreatedResponse({
        description: '上传成功',
        type: UploadLocalResponseDto,
    })
    @ApiConsumes('multipart/form-data')
    @ApiConflictResponse({
        description: '文件重复上传',
        schema: {
            $ref: getSchemaPath(HttpExceptionOutputDto),
        },
    })
    async uploadFile(@UploadedFile() file: Express.Multer.File, @Body() body: UploadLocalBodyDto) {
        if (file === undefined) {
            throw new BadRequestException('File parse failed!');
        }
        return await this.localService.uploadFile(body.token, file);
    }
}
