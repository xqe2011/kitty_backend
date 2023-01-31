import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { ApiException } from 'src/exceptions/api.exception';
import { Error } from 'src/exceptions/enums/error.enum';
import { EntityManager, Repository } from 'typeorm';
import { CatTag } from '../../entities/cat-tag.entity';

@Injectable()
export class TagService {
    constructor(
        @InjectRepository(CatTag)
        private catTagRepository: Repository<CatTag>,
        @InjectEntityManager()
        private entityManager: EntityManager,
    ) {}

    /**
     * 检查猫咪TAG存在
     * 
     * @param id 标签ID
     * @returns 是否存在
     */
    async isTagExists(id: number) {
        return (
            (await this.catTagRepository.count({
                where: {
                    id: id,
                },
            })) > 0
        );
    }

    /**
     * 根据猫咪ID获取标签
     * 
     * @param catID 猫咪ID
     * @returns 标签信息
     */
    async getTagsByCatID(catID: number) {
        return (await this.catTagRepository.find({
            where: {
                cat: {
                    id: catID
                }
            },
            select: ['id', 'name', 'createdDate']
        })) as Pick<CatTag, 'id' | 'name' | 'createdDate'>[];
    }

    /**
     * 添加标签
     * 
     * @param catID 猫咪ID
     * @param name 标签名称
     * @returns 标签ID
     */
    async addTag(catID: number, name: string) {
        if ((await this.catTagRepository.count({ cat: { id: catID }, name: name })) > 0) {
            throw new ApiException(Error.DISALLOW_DUPLICATE_TAG);
        }
        return (await this.catTagRepository.insert({
            cat: {
                id: catID
            },
            name: name
        })).identifiers[0].id;
    }

    /**
     * 删除标签
     * 
     * @param id 标签ID
     */
    async deleteTag(id: number) {
        await this.catTagRepository.softDelete(id);
    }

    /**
     * 根据猫咪ID删除所有标签
     * 
     * @param catID 猫咪ID
     * @param manager 事务,不传入则创建事务
     */
    async deleteTagsByCatID(catID: number, manager?: EntityManager) {
        const run = async realManager => {
            await realManager.softDelete(CatTag, { cat: { id: catID } });
        };
        if (manager !== undefined) {
            await run(manager);
        } else {
            await this.entityManager.transaction(run);
        }
    }
}
