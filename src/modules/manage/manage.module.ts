import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatModule } from '../cat/cat.module';
import { CommentModule } from '../comment/comment.module';
import { FeedbackModule } from '../feedback/feedback.module';
import { QRCodeModule } from '../qrcode/qrcode.module';
import { ShopModule } from '../shop/shop.module';
import { UserModule } from '../user/user.module';
import { CatPhotoController } from './cat-photo/cat-photo.controller';
import { CatController } from './cat/cat.controller';
import { CommentController } from './comment/comment.controller';
import { CommentsAreaController } from './comments-area/comments-area.controller';
import { ManageLog } from './entities/manage-log.entity';
import { FeedbackController } from './feedback/feedback.controller';
import { ManageLogService } from './manage-log/manage-log.service';
import { ConsumeController } from './qrcode/consume.controller';
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
        TypeOrmModule.forFeature([ ManageLog ])
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
        FeedbackController
    ]
})
export class ManageModule {}
