import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopItemPhoto } from './entities/shop-item-photo.entity';
import { ShopItem } from './entities/shop-item.entity';
import { ShopController } from './shop/shop.controller';
import { ShopService } from './shop/shop.service';

@Module({
    imports: [TypeOrmModule.forFeature([ShopItem, ShopItemPhoto])],
    providers: [ShopService],
    controllers: [ShopController],
    exports: [],
})
export class ShopModule {}
