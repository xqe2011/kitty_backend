import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShopItemPhoto } from '../entities/shop-item-photo.entity';
import { ShopItem } from '../entities/shop-item.entity';

@Injectable()
export class ShopService {
    constructor(
        @InjectRepository(ShopItem)
        private itemRepository: Repository<ShopItem>,
        @InjectRepository(ShopItemPhoto)
        private itemPhotoRepository: Repository<ShopItemPhoto>,
    ) {}

    /**
     * 获取待售商品列表
     * @param limit 限制数量
     * @param start 开始位置
     * @returns 商品信息
     */
    async getItemsList(limit: number, start: number) {
        const queryBuildinger = this.itemRepository.createQueryBuilder('item');
        queryBuildinger.leftJoinAndSelect('item.photos', 'photo');
        queryBuildinger.andWhere({ visible: true });
        queryBuildinger.take(limit);
        queryBuildinger.skip(start);
        queryBuildinger.select([
            'item.id',
            'item.name',
            'item.description',
            'item.price',
            'photo.id',
            'photo.fileName'
        ]);
        const itemsWithoutCover = await queryBuildinger.getMany() as any;
        for (const item of itemsWithoutCover) {
            item.coverPhoto = await this.itemPhotoRepository.findOne({
                where: {
                    item: {
                        id: item.id
                    },
                    isCover: true,
                },
                select: ['id', 'fileName']
            });
        }
        return itemsWithoutCover as {
            id: number,
            name: string;
            description: string;
            price: number;
            coverPhoto: string;
            photos: {
                id: number;
                fileName: string;
            }[]
        }[];
        
    }

    /**
     * 商品是否存在
     * @param id 商品ID
     * @returns 是否存在
     */
    async isItemExists(id: number) {
        return (await this.itemRepository.count({ id: id })) > 0;
    }
}
