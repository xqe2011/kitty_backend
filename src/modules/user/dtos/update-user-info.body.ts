import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Validate } from 'class-validator';
import { FileType } from 'src/modules/file/enums/file-type.enum';
import { IsFileTokenValidValidator } from 'src/modules/file/validatos/is-file-token-valid.validator';

export class UpdateUserInfoBodyDto {
    @IsOptional()
    @IsString()
    @ApiProperty({ description: '用户昵称', required: false })
    nickName: string;

    @IsOptional()
    @Validate(IsFileTokenValidValidator, [
        FileType.COMPRESSED_IMAGE,
        FileType.UNCOMPRESSED_IMAGE,
    ])
    @ApiProperty({ description: '用户头像文件Token', required: false })
    avatarFileToken: string;
}
