import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNotEmptyObject, IsNumber, Min, Validate, ValidateIf, ValidateNested, } from 'class-validator';
import { IsArticleIDValidValidator } from 'src/modules/article/validators/is-articleid-valid.validator';
import { IsCatIDValidValidator } from 'src/modules/cat/validators/is-catid-valid.validator';
import { IsPhotoIDValidValidator } from 'src/modules/cat/validators/is-photoid-valid.validator';
import { IsCommentIDValidValidator } from 'src/modules/comment/validators/is-commentid-valid.validator';
import { IsFeedbackIDValidValidator } from 'src/modules/feedback/validators/is-feedbackid-valid.validator';
import { IsLikeableEntityIDValidValidator } from 'src/modules/like/validators/is-likeable-entityid-valid.validator';
import { IsItemIDValidValidator } from 'src/modules/shop/validators/is-itemid-valid.validator';
import { IsOrderIDValidValidator } from 'src/modules/shop/validators/is-orderid-valid.validator';
import { UserLogType } from '../enums/user-log-type.enum';

class LogViewShopBodyDto {
    @Validate(IsItemIDValidValidator)
    @ApiProperty({ description: '商品ID' })
    itemID: number;

    @IsNumber()
    @Min(0)
    @ApiProperty({ description: '停留时间' })
    dwellTime: number;
}

class LogBuyBodyDto {
    @Validate(IsOrderIDValidValidator)
    @ApiProperty({ description: '订单ID' })
    orderID: number;
}

class LogFeedbackBodyDto {
    @Validate(IsFeedbackIDValidValidator)
    @ApiProperty({ description: '反馈ID' })
    feedbackID: number;
}

class LogLikeBodyDto {
    @Validate(IsLikeableEntityIDValidValidator)
    @ApiProperty({ description: '点赞实体ID' })
    likeableEntityID: number;
}

class LogCreateCommentBodyDto {
    @Validate(IsCommentIDValidValidator, [false])
    @ApiProperty({ description: '评论ID' })
    commentID: number;
}

class LogViewCatBodyDto {
    @Validate(IsCatIDValidValidator)
    @ApiProperty({ description: '猫咪ID' })
    catID: number;

    @IsNumber()
    @Min(0)
    @ApiProperty({ description: '停留时间' })
    dwellTime: number;
}

class LogUploadPhotoBodyDto {
    @Validate(IsPhotoIDValidValidator)
    @ApiProperty({ description: '用户照片ID' })
    photoID: number;
}

class LogLoginBodyDto {}

class LogRaderBodyDto {}

class LogViewArticleBodyDto {
    @Validate(IsArticleIDValidValidator)
    @ApiProperty({ description: '文章ID' })
    articleID: number;

    @IsNumber()
    @Min(0)
    @ApiProperty({ description: '停留时间' })
    dwellTime: number;
}

export class WriteLogBodyDto {
    @IsEnum(UserLogType)
    @ApiProperty({
        description: '用户日记类型,0表示查看猫咪信息,1表示发布评论,2表示上传猫咪照片,3表示用户登陆,4表示使用猫咪雷达功能,5表示阅读文章,6表示点赞,7表示反馈,8表示购买商品,9表示查看商品',
        enum: UserLogType,
    })
    type: UserLogType;

    @ValidateIf((o) => o.type === UserLogType.VIEW_CAT)
    @ValidateNested()
    @IsNotEmptyObject()
    @Type(() => LogViewCatBodyDto)
    @ApiProperty({
        description: '日记信息,类型为查看猫咪信息时必填',
        required: false,
    })
    message0: LogViewCatBodyDto;

    @ValidateIf((o) => o.type === UserLogType.ADD_COMMENT)
    @ValidateNested()
    @IsNotEmptyObject()
    @Type(() => LogCreateCommentBodyDto)
    @ApiProperty({
        description: '日记信息,类型为发布评论时必填',
        required: false,
    })
    message1: LogCreateCommentBodyDto;

    @ValidateIf((o) => o.type === UserLogType.UPLOAD_PHOTO)
    @ValidateNested()
    @IsNotEmptyObject()
    @Type(() => LogUploadPhotoBodyDto)
    @ApiProperty({
        description: '日记信息,类型为上传猫咪照片时必填',
        required: false,
    })
    message2: LogUploadPhotoBodyDto;

    @ValidateIf((o) => o.type === UserLogType.LOGIN)
    @ValidateNested()
    @IsNotEmptyObject()
    @Type(() => LogLoginBodyDto)
    @ApiProperty({
        description: '日记信息,类型为用户登陆时必填',
        required: false,
    })
    message3: LogLoginBodyDto;

    @ValidateIf((o) => o.type === UserLogType.RADER)
    @ValidateNested()
    @IsNotEmptyObject()
    @Type(() => LogRaderBodyDto)
    @ApiProperty({
        description: '日记信息,类型为使用猫咪雷达功能时必填',
        required: false,
    })
    message4: LogRaderBodyDto;

    @ValidateIf((o) => o.type === UserLogType.VIEW_ARTICLE)
    @ValidateNested()
    @IsNotEmptyObject()
    @Type(() => LogViewArticleBodyDto)
    @ApiProperty({
        description: '日记信息,类型为阅读文章时必填',
        required: false,
    })
    message5: LogViewArticleBodyDto;

    @ValidateIf((o) => o.type === UserLogType.LIKE)
    @ValidateNested()
    @IsNotEmptyObject()
    @Type(() => LogLikeBodyDto)
    @ApiProperty({
        description: '日记信息,类型为点赞时必填',
        required: false,
    })
    message6: LogLikeBodyDto;

    @ValidateIf((o) => o.type === UserLogType.FEEDBACK)
    @ValidateNested()
    @IsNotEmptyObject()
    @Type(() => LogFeedbackBodyDto)
    @ApiProperty({
        description: '日记信息,类型为反馈时必填',
        required: false,
    })
    message7: LogFeedbackBodyDto;

    @ValidateIf((o) => o.type === UserLogType.BUY)
    @ValidateNested()
    @IsNotEmptyObject()
    @Type(() => LogBuyBodyDto)
    @ApiProperty({
        description: '日记信息,类型为购买商品时必填',
        required: false,
    })
    message8: LogBuyBodyDto;

    @ValidateIf((o) => o.type === UserLogType.VIEW_SHOP)
    @ValidateNested()
    @IsNotEmptyObject()
    @Type(() => LogViewShopBodyDto)
    @ApiProperty({
        description: '商品信息,类型为查看商品时必填',
        required: false,
    })
    message9: LogViewShopBodyDto;

    @IsDateString()
    @ApiProperty({ description: '日记发生的时间' })
    date: Date;
}
