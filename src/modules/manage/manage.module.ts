import { Module } from '@nestjs/common';
import { CatModule } from '../cat/cat.module';
import { CommentModule } from '../comment/comment.module';
import { ShopModule } from '../shop/shop.module';
import { CatPhotoController } from './cat-photo/cat-photo.controller';
import { CatController } from './cat/cat.controller';
import { CommentController } from './comment/comment.controller';
import { CommentsAreaController } from './comments-area/comments-area.controller';
import { ShopOrderController } from './shop-order/shop-order.controller';

@Module({
    imports: [ CatModule, CommentModule, ShopModule ],
    controllers: [ CatController, CatPhotoController, CommentController, CommentsAreaController, ShopOrderController ]
})
export class ManageModule {}
