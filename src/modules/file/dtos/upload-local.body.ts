import { ApiProperty } from '@nestjs/swagger';
import { Validate } from 'class-validator';
import { IsUploadTokenValidValidator } from '../validatos/is-upload-token-valid.validator';

export class UploadLocalBodyDto {
    @Validate(IsUploadTokenValidValidator)
    @ApiProperty({ description: '文件上传Token,需要通过文件上传接口获得' })
    token: string;

    @ApiProperty({ type: 'string', format: 'binary', description: '文件' })
    file: any;
}
