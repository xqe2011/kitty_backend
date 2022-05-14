import { ApiProperty } from '@nestjs/swagger';

export class QiniuCallbackResponseDto {
    @ApiProperty({
        description:
            '文件Tokenn,用于标记一个已经存储在服务器上的文件,可以用于需要上传文件的接口',
    })
    fileToken: string;
}
