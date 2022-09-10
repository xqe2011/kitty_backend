import { Module } from '@nestjs/common';
import { CatModule } from '../cat/cat.module';
import { CommentModule } from '../comment/comment.module';
import { ShopModule } from '../shop/shop.module';
import { UserModule } from '../user/user.module';
import { CatPhotoController } from './cat-photo/cat-photo.controller';
import { CatController } from './cat/cat.controller';
import { CommentController } from './comment/comment.controller';
import { CommentsAreaController } from './comments-area/comments-area.controller';
import { ShopOrderController } from './shop-order/shop-order.controller';
import { UserController } from './user/user.controller';

@Module({
    imports: [ CatModule, CommentModule, ShopModule, UserModule ],
    controllers: [ CatController, CatPhotoController, CommentController, CommentsAreaController, ShopOrderController, UserController ]
})
export class ManageModule {}
