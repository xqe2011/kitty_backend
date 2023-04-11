import { ApiProperty } from '@nestjs/swagger';
import { Validate } from 'class-validator';
import { FileType } from 'src/modules/file/enums/file-type.enum';
import { IsFileTokenValidValidator } from 'src/modules/file/validatos/is-file-token-valid.validator';

export class AddPhotoToArticleBodyDto {
    @Validate(IsFileTokenValidValidator, [
        FileType.COMPRESSED_IMAGE,
        FileType.UNCOMPRESSED_IMAGE,
    ])
    @ApiProperty({ description: '文件Token,成功上传文件后获得' })
    fileToken: string;
}
