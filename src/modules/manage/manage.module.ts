import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatModule } from '../cat/cat.module';
import { CommentModule } from '../comment/comment.module';
import { FeedbackModule } from '../feedback/feedback.module';
import { LikeModule } from '../like/like.module';
import { QRCodeModule } from '../qrcode/qrcode.module';
import { SettingModule } from '../setting/setting.module';
import { SettingController } from './setting/setting.controller';
import { ShopModule } from '../shop/shop.module';
import { UserModule } from '../user/user.module';
import { CatPhotoController } from './cat-photo/cat-photo.controller';
import { CatController } from './cat/cat.controller';
import { CommentController } from './comment/comment.controller';
import { CommentsAreaController } from './comments-area/comments-area.controller';
import { ManageLog } from './entities/manage-log.entity';
import { FeedbackController } from './feedback/feedback.controller';
import { LikeableEntityController } from './likeable-entity/likeable-entity.controller';
import { ManageLogService } from './manage-log/manage-log.service';
import { ConsumeController } from './qrcode/consume.controller';
import { ShopItemController } from './shop-item/shop-item.controller';
import { ShopOrderController } from './shop-order/shop-order.controller';
import { UserController } from './user/user.controller';

@Module({
    imports: [
        CatModule,
        CommentModule,
        ShopModule,
        UserModule,
        QRCodeModule,
        FeedbackModule,
        TypeOrmModule.forFeature([ ManageLog ]),
        LikeModule,
        SettingModule
    ],
    providers: [ ManageLogService ],
    controllers: [
        CatController,
        CatPhotoController,
        CommentController,
        CommentsAreaController,
        ShopOrderController,
        UserController,
        ConsumeController,
        FeedbackController,
        LikeableEntityController,
        ShopItemController,
        SettingController
    ]
})
export class ManageModule {}
