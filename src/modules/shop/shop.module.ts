import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingModule } from '../setting/setting.module';
import { UserModule } from '../user/user.module';
import { Order } from './entities/order.entity';
import { ShopItemPhoto } from './entities/shop-item-photo.entity';
import { ShopItem } from './entities/shop-item.entity';
import { OrderController } from './order/order.controller';
import { OrderService } from './order/order.service';
import { ShopController } from './shop/shop.controller';
import { ShopService } from './shop/shop.service';
import { IsItemIDValidValidator } from './validators/is-itemid-valid.validator';
import { IsOrderIDValidValidator } from './validators/is-orderid-valid.validator';

@Module({
    imports: [
        TypeOrmModule.forFeature([ShopItem, ShopItemPhoto, Order]),
        UserModule,
        SettingModule
    ],
    providers: [ShopService, OrderService, IsItemIDValidValidator, IsOrderIDValidValidator],
    controllers: [ShopController, OrderController],
    exports: [OrderService],
})
export class ShopModule {}
