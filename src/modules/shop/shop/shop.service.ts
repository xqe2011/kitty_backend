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
     * @returns 商品简略信息
     */
    async getItemsList(limit: number, start: number) {
        const queryBuildinger = this.itemRepository.createQueryBuilder('item');
        queryBuildinger.andWhere({ visible: true });
        queryBuildinger.take(limit);
        queryBuildinger.skip(start);
        queryBuildinger.select([
            'item.id',
            'item.name',
            'item.price'
        ]);
        const itemsWithoutCover = await queryBuildinger.getMany() as any;
        for (const item of itemsWithoutCover) {
            item.coverPhoto = (await this.getPhotosByItemID(item.id, true))[0];
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
     * 根据商品ID获取可供展示的商品详细信息
     * @param id 商品ID
     * @returns 商品信息
     */
    async getItemInfoByID(id: number) {
        return await this.itemRepository.findOne({
            where: { id },
            select: ['id', 'description', 'name', 'price']
        });
    }

    /**
     * 根据商品ID获取图片集合
     * @param id 商品ID
     * @param isCover 是否为封面图
     * @returns 图片集合
     */
    async getPhotosByItemID(id: number, isCover: boolean) {
        return await this.itemPhotoRepository.find({
            where: {
                item: {
                    id
                },
                isCover: isCover,
            },
            select: ['id', 'fileName']
        });
    }

    /**
     * 通过商品ID获取猫咪信息和精选/封面照片
     * @param id 商品ID
     * @returns 商品信息和封面照片和普通照片集合
     */
    async getItemInfoWithSelectedAndCoverPhotos(id: number) {
        return {
            info: await this.getItemInfoByID(id),
            photos: await this.getPhotosByItemID(id, false),
            coverPhoto: (await this.getPhotosByItemID(id, true))[0],
        };
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
