import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentsArea } from '../entities/comments-area.entity';

@Injectable()
export class CommentsAreaService {
    constructor(
        @InjectRepository(CommentsArea)
        private commentsAreaRepository: Repository<CommentsArea>,
    ) {}

    /**
     * 获取评论区状态信息
     * @param id 评论区ID
     * @returns 评论区状态
     */
    async getAreaInfoByID(id: number) {
        return this.commentsAreaRepository.findOne({
            where: {
                id: id,
            },
            select: ['isDisplay'],
        }) as any as Pick<CommentsArea, 'isDisplay'>;
    }

    /**
     * 判断评论区ID是否存在
     * @param id 评论区ID
     * @returns 是否可见
     */
    async isAreaExists(id: number) {
        return (await this.commentsAreaRepository.count({ id: id })) > 0;
    }

    /**
     * 判断评论区是否存在并可见
     * @param id 评论区ID
     * @returns 是否可见
     */
    async isAreaVisible(id: number) {
        return (await this.commentsAreaRepository.count({
            id: id,
            isDisplay: true,
        })) > 0;
    }

    /**
     * 创建评论区
     * @returns 评论区ID
     */
    async createArea() {
        let area = new CommentsArea();
        area.isDisplay = true;
        area = await this.commentsAreaRepository.save(area);
        return area.id;
    }

    /**
     * 更改评论区显示状态
     * @param id 评论区ID
     * @param isDisplay 是否显示评论区
     */
    async setAreaVisible(id: number, isDisplay: boolean) {
        await this.commentsAreaRepository.update(
            { id: id },
            { isDisplay: isDisplay },
        );
    }
}
