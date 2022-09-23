import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { FileService } from 'src/modules/file/file/file.service';
import { LikeableEntityService } from 'src/modules/like/likeable-entity/likeable-entity.service';
import { Any, EntityManager, Repository } from 'typeorm';
import { ShopItemPhoto } from '../entities/shop-item-photo.entity';
import { ShopItem } from '../entities/shop-item.entity';

@Injectable()
export class ShopService {
    constructor(
        @InjectRepository(ShopItem)
        private itemRepository: Repository<ShopItem>,
        @InjectRepository(ShopItemPhoto)
        private itemPhotoRepository: Repository<ShopItemPhoto>,
        private fileService: FileService,
        @InjectEntityManager()
        private entityManager: EntityManager,
        private likeableEntityService: LikeableEntityService
    ) {}

    /**
     * 创建商品
     * @param name 商品名称
     * @param description 商品描述
     * @param price 商品价格
     * @param visible 商品是否可见
     * @retrun 商品ID
     */
    async createItem(name: string, description: string, price: number, visible: boolean) {
        return await this.entityManager.transaction(async manager => {
            const item = new ShopItem();
            item.name = name;
            item.description = description;
            item.price = price;
            item.visible = visible;
            item.likeableEntityID = await this.likeableEntityService.createEntity(false, manager);
            const result = await manager.save(item);
            return result.id;
        });
    }

    /**
     * 更新商品照片信息
     * @param id 照片ID
     * @param isCover 照片是否为封面
     */
    async updateItemPhoto(id: number, isCover: boolean) {
        await this.itemPhotoRepository.update({ id }, { isCover });
    }

    /**
     * 更新商品信息
     * @param id 商品ID
     * @param name 商品名称
     * @param description 商品描述
     * @param price 商品价格
     * @param visible 商品是否可见
     */
    async updateItem(id: number, name: string, description: string, price: number, visible: boolean) {
        await this.itemRepository.update({ id }, { name, description, price, visible });
    }

    /**
     * 将照片添加到商品
     * @param id 商品ID
     * @param fileToken 照片文件Token
     */
    async addPhotoToItem(id: number, fileToken: string) {
        const photo = new ShopItemPhoto();
        photo.item = { id } as any;
        photo.fileName = this.fileService.getFileNameByToken(fileToken);
        await this.itemPhotoRepository.save(photo);
    }

    /**
     * 根据商品ID删除对应的照片集
     * @param id 照片ID
     * @param manager 事务,不传入则不使用事务写
     */
    async deletePhoto(id: number, manager?: EntityManager) {
        const entityManager = manager || this.entityManager;
        await entityManager.softDelete(ShopItemPhoto, { id });
    }

    /**
     * 删除商品
     * @param id 商品ID
     */
    async deleteItem(id: number) {
        await this.entityManager.transaction(async manager => {
            const item = await manager.findOne(ShopItem, { id });
            await manager.softDelete(ShopItemPhoto, { item: { id } });
            await manager.softDelete(ShopItem, { id });
            await this.likeableEntityService.deleteEntity(item.likeableEntityID, manager);
        });
    }

    /**
     * 获取待售商品列表
     * @param onlyVisible 是否只获取可见商品
     * @param limit 限制数量
     * @param start 开始位置
     * @returns 商品简略信息
     */
    async getItemsList(onlyVisible: boolean, limit: number, start: number) {
        const queryBuildinger = this.itemRepository.createQueryBuilder('item');
        if (onlyVisible) {
            queryBuildinger.andWhere({ visible: true });
        }
        queryBuildinger.take(limit);
        queryBuildinger.skip(start);
        queryBuildinger.select([
            'item.id',
            'item.name',
            'item.price',
            'item.visible',
            'item.likeableEntityID'
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
            visible: boolean;
            likeableEntityID: number;
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
            select: ['id', 'description', 'name', 'price', 'likeableEntityID']
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
