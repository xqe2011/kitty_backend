import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiException } from 'src/exceptions/api.exception';
import { Error } from 'src/exceptions/enums/error.enum';
import { EntityManager, Repository } from 'typeorm';
import { LikeItem } from '../entities/like-item.entity';
import { LikeableEntity } from '../entities/likeable-entity.entity';

@Injectable()
export class LikeableEntityService {
    constructor(
        @InjectRepository(LikeableEntity)
        private likeableEntityRepository: Repository<LikeableEntity>,
        @InjectRepository(LikeItem)
        private likeItemRepository: Repository<LikeItem>,
    ) {}

    /**
     * 点赞
     * @param userID 用户ID
     * @param entityID 点赞实体ID
     */
    async like(userID: number, entityID: number) {
        /* 不允许未开启重复喜欢功能的重复喜欢 */
        if (!(await this.likeableEntityRepository.findOne({ id: entityID })).allowDuplicateLike && await this.isEntityLiked(userID, entityID)) {
            throw new ApiException(Error.DISALLOW_DUPLICATE_LIKE);
        }
        await this.likeItemRepository.insert({ entity: { id: entityID }, user: { id: userID } });
    }

    /**
     * 取消点赞
     * @param userID 用户ID
     * @param entityID 点赞实体ID
     */
    async cancelLike(userID: number, entityID: number) {
        await this.likeItemRepository.softDelete({ entity: { id: entityID }, user: { id: userID } });
    }

    /**
     * 用户是否已点赞
     * @param userID 用户ID
     * @param entityID 点赞实体ID
     */
    async isEntityLiked(userID: number, entityID: number) {
        return await this.likeItemRepository.count({ entity: { id: entityID }, user: { id: userID } }) > 0;
    }

    /**
     * 获取点赞实体信息
     * @param userID 用户ID
     * @param entityID 点赞实体ID
     * @returns 点赞实体信息
     */
    async getLikeableEntityInfoByID(userID: number, entityID: number) {
        const data: {
            isDisplay: boolean;
            count: number;
            isLiked: boolean;
            allowDuplicateLike: boolean;
        } = await this.likeableEntityRepository.findOne({
            where: {
                id: entityID,
            },
            select: ['isDisplay', 'allowDuplicateLike'],
        }) as any;
        data.count = await this.likeItemRepository.count({ entity: { id: entityID } });
        data.isLiked = await this.isEntityLiked(userID, entityID);
        return data;
    }

    /**
     * 判断点赞实体ID是否存在
     * @param id 点赞实体ID
     * @returns 是否可见
     */
    async isEntityExists(id: number) {
        return (await this.likeableEntityRepository.count({ id: id })) > 0;
    }

    /**
     * 创建点赞实体
     * @param allowDuplicateLike 是否允许重复喜欢
     * @param manager 事务,不传入则不使用事务写
     * @returns 点赞实体ID
     */
    async createEntity(allowDuplicateLike: boolean, manager: EntityManager) {
        let entity = new LikeableEntity();
        entity.isDisplay = true;
        entity.allowDuplicateLike = false;
        entity = manager === undefined ? await this.likeableEntityRepository.save(entity) : await manager.save(entity);
        return entity.id;
    }

    /**
     * 更新点赞实体信息
     * @param id 评论区ID
     * @param isDisplay 是否展示
     * @param allowDuplicateLike 是否允许重复点赞
     */
    async updateEntityInfo(id: number, isDisplay: boolean, allowDuplicateLike: boolean) {
        await this.likeableEntityRepository.update(id, { isDisplay, allowDuplicateLike });
    }
}
