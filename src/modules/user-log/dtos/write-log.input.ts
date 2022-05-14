import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNotEmptyObject, IsNumber, Min, Validate, ValidateIf, ValidateNested, } from 'class-validator';
import { IsArticleIDValidValidator } from 'src/modules/article/validators/is-articleid-valid.validator';
import { IsCatIDValidValidator } from 'src/modules/cat/validators/is-catid-valid.validator';
import { IsPhotoIDValidValidator } from 'src/modules/cat/validators/is-photoid-valid.validator';
import { UserLogType } from '../enums/user-log-type.enum';

class LogViewCatInputDto {
    @Validate(IsCatIDValidValidator)
    @ApiProperty({ description: '猫咪ID' })
    catID: number;

    @IsNumber()
    @Min(0)
    @ApiProperty({ description: '停留时间' })
    dwellTime: number;
}

class LogUploadPhotoInputDto {
    @Validate(IsPhotoIDValidValidator)
    @ApiProperty({ description: '用户照片ID' })
    photoID: number;
}

class LogLoginInputDto {}

class LogRaderInputDto {}

class LogViewArticleInputDto {
    @Validate(IsArticleIDValidValidator)
    @ApiProperty({ description: '文章ID' })
    articleID: number;

    @IsNumber()
    @Min(0)
    @ApiProperty({ description: '停留时间' })
    dwellTime: number;
}

export class WriteLogInputDto {
    @IsEnum(UserLogType)
    @ApiProperty({
        description:
            '用户日记类型,0表示查看猫咪信息,1表示发布评论,2表示上传猫咪照片,3表示用户登陆,4表示使用猫咪雷达功能,5表示阅读文章',
        enum: UserLogType,
    })
    type: UserLogType;

    @ValidateIf((o) => o.type === UserLogType.VIEW_CAT)
    @ValidateNested()
    @IsNotEmptyObject()
    @Type(() => LogViewCatInputDto)
    @ApiProperty({
        description: '日记信息,类型为查看猫咪信息时必填',
        required: false,
    })
    message0: LogViewCatInputDto;

    @ValidateIf((o) => o.type === UserLogType.UPLOAD_PHOTO)
    @ValidateNested()
    @IsNotEmptyObject()
    @Type(() => LogUploadPhotoInputDto)
    @ApiProperty({
        description: '日记信息,类型为上传猫咪照片时必填',
        required: false,
    })
    message2: LogUploadPhotoInputDto;

    @ValidateIf((o) => o.type === UserLogType.LOGIN)
    @ValidateNested()
    @IsNotEmptyObject()
    @Type(() => LogLoginInputDto)
    @ApiProperty({
        description: '日记信息,类型为用户登陆时必填',
        required: false,
    })
    message3: LogLoginInputDto;

    @ValidateIf((o) => o.type === UserLogType.RADER)
    @ValidateNested()
    @IsNotEmptyObject()
    @Type(() => LogRaderInputDto)
    @ApiProperty({
        description: '日记信息,类型为使用猫咪雷达功能时必填',
        required: false,
    })
    message4: LogRaderInputDto;

    @ValidateIf((o) => o.type === UserLogType.VIEW_ARTICLE)
    @ValidateNested()
    @IsNotEmptyObject()
    @Type(() => LogViewArticleInputDto)
    @ApiProperty({
        description: '日记信息,类型为阅读文章时必填',
        required: false,
    })
    message5: LogViewArticleInputDto;

    @IsDateString()
    @ApiProperty({ description: '日记发生的时间' })
    date: Date;
}
