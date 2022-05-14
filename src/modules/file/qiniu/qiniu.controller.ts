import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { QiniuCallbackBodyDto } from '../dtos/qiniu-callback.body';
import { QiniuCallbackResponseDto } from '../dtos/qiniu-callback.response';
import { QiniuService } from './qiniu.service';

@Controller('files/qiniu')
@ApiTags('文件管理')
export class QiniuController {
    constructor(private qiniuService: QiniuService) {}

    @Post('callback')
    @ApiHeader({
        description: '七牛服务器认证信息',
        name: 'Authorization',
    })
    @ApiCreatedResponse({
        description: '回调调用成功',
        type: QiniuCallbackResponseDto,
    })
    @ApiOperation({
        summary: '七牛上传成功回调',
        description: '七牛上传成功回调,只能由七牛服务器调用',
    })
    async callback(@Body() body: QiniuCallbackBodyDto, @Headers('Authorization') authorization: string) {
        return await this.qiniuService.getFileTokenByQiniuAuthorization(body.fileName, body.fileType, authorization);
    }
}
