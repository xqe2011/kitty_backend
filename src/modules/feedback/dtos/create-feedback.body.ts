import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, Validate, ValidateIf } from 'class-validator';
import { IsCatIDValidValidator } from 'src/modules/cat/validators/is-catid-valid.validator';
import { FileType } from 'src/modules/file/enums/file-type.enum';
import { IsFileTokenValidValidator } from 'src/modules/file/validatos/is-file-token-valid.validator';
import { FeedbackType } from '../enums/feedback-type.enum';

export class CreateFeedbackBodyDto {
    @IsEnum(FeedbackType)
    @ApiProperty({
        description:
            '反馈类型,0表示猫咪问题,1表示小程序问题,2表示组织建议',
        enum: FeedbackType,
    })
    type: FeedbackType;

    @ValidateIf((o) => o.type === FeedbackType.CAT)
    @Validate(IsCatIDValidValidator)
    @IsOptional()
    @ApiProperty({
        description: '猫咪ID,若为undefined则不绑定至特定猫咪,仅适用于猫咪问题类型',
        required: false,
    })
    catID: number;

    @IsArray()
    @Validate(IsFileTokenValidValidator, [
        FileType.COMPRESSED_IMAGE,
        FileType.UNCOMPRESSED_IMAGE,
    ], { each: true })
    @ApiProperty({ description: '文件Token,成功上传文件后获得' })
    fileTokens: string[];

    @IsString()
    @ApiProperty({ description: '反馈内容' })
    content: string;
}
