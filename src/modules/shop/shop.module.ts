import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikeModule } from '../like/like.module';
import { SettingModule } from '../setting/setting.module';
import { UserModule } from '../user/user.module';
import { Order } from './entities/order.entity';
import { ShopItemPhoto } from './entities/shop-item-photo.entity';
import { ShopItem } from './entities/shop-item.entity';
import { OrderController } from './order/order.controller';
import { OrderService } from './order/order.service';
import { ShopController } from './shop/shop.controller';
import { ShopService } from './shop/shop.service';
import { IsItemPhotoIDValidValidator } from './validators/is-item-photoid-valid.validator';
import { IsItemIDValidValidator } from './validators/is-itemid-valid.validator';
import { IsOrderIDValidValidator } from './validators/is-orderid-valid.validator';

@Module({
    imports: [
        TypeOrmModule.forFeature([ShopItem, ShopItemPhoto, Order]),
        UserModule,
        SettingModule,
        LikeModule
    ],
    providers: [ShopService, OrderService, IsItemIDValidValidator, IsOrderIDValidValidator, IsItemPhotoIDValidValidator],
    controllers: [ShopController, OrderController],
    exports: [OrderService, ShopService],
})
export class ShopModule {}
