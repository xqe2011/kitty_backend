import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { Order } from './entities/order.entity';
import { ShopItemPhoto } from './entities/shop-item-photo.entity';
import { ShopItem } from './entities/shop-item.entity';
import { OrderController } from './order/order.controller';
import { OrderService } from './order/order.service';
import { ShopController } from './shop/shop.controller';
import { ShopService } from './shop/shop.service';
import { IsItemIDValidValidator } from './validators/is-itemid-valid.validator';

@Module({
    imports: [
        TypeOrmModule.forFeature([ShopItem, ShopItemPhoto, Order]),
        UserModule
    ],
    providers: [ShopService, OrderService, IsItemIDValidValidator],
    controllers: [ShopController, OrderController],
    exports: [],
})
export class ShopModule {}
