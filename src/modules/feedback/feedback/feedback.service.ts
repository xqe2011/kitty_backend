import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileService } from 'src/modules/file/file/file.service';
import { Repository } from 'typeorm';
import { FeedbackPhoto } from '../entities/feedback-photo.entity';
import { Feedback } from '../entities/feedback.entity';
import { FeedbackProgress } from '../enums/feedback-progress.enum';
import { FeedbackType } from '../enums/feedback-type.enum';

@Injectable()
export class FeedbackService {
    constructor(
        @InjectRepository(Feedback)
        private feedbackRepository: Repository<Feedback>,
        @InjectRepository(FeedbackPhoto)
        private feedbackPhotoRepository: Repository<FeedbackPhoto>,
        private fileService: FileService
    ) {}

    /**
     * 判断反馈ID是否存在
     * @param id 反馈ID
     * @returns 是否存在
     */
    async isFeedbackExists(id: number) {
        return (await this.feedbackRepository.count({ id: id })) > 0;
    }

    /**
     * 更新反馈信息
     * @param id 反馈ID
     * @param type 反馈类型
     * @param progress 反馈状态
     */
    async updateFeedbackInfo(id: number, type: FeedbackType, progress: FeedbackProgress) {
        await this.feedbackRepository.update(id, { type, progress });
    }

    /**
     * 删除反馈
     *
     * @param id 反馈ID
     */
    async deleteFeedback(id: number) {
        await this.feedbackRepository.softDelete(id);
    }

    /**
     * 根据反馈ID获取照片
     * @param feedbackID 反馈ID
     * @param limit 限制数量
     * @param start 开始位置
     * @returns 照片列表
     */
    async getPhotosByFeedbackID(feedbackID: number, limit: number, start: number) {
        return await this.feedbackPhotoRepository.find({
            where: {
                feedback: {
                    id: feedbackID
                }
            },
            select: ['id', 'fileName'],
            take: limit,
            skip: start
        }) as Pick<FeedbackPhoto, 'id' | 'fileName'>[];
    }

    /**
     * 搜索反馈,默认按照时间倒序
     * @param userID 用户ID,若为undefined则不指定
     * @param progress 反馈进度,若为undefined则不指定
     * @param type 反馈类型,若为undefined则不指定
     * @param limit 限制数量
     * @param start 开始位置
     * @param photoLimit 照片限制数量
     * @returns 反馈列表
     */
    async searchFeedbacks(userID: number, progress: FeedbackProgress, type: FeedbackType, limit: number, start: number, photoLimit: number) {
        const queryBuilder = this.feedbackRepository.createQueryBuilder('order');
        if (type !== undefined) queryBuilder.andWhere({ type });
        if (progress !== undefined) queryBuilder.andWhere({ progress });
        if (userID !== undefined) queryBuilder.andWhere({ user: { id: userID } });
        queryBuilder.skip(start);
        queryBuilder.take(limit);
        queryBuilder.select(['id', 'type', 'progress', 'content', 'createdDate', 'userId as userID', 'catId as catID']);
        queryBuilder.orderBy("createdDate", "DESC");
        const data: (Pick<Feedback, 'id' | 'type' | 'progress' | 'content' | 'createdDate'> & {
            userID: number;
            catID: number;
            photos: Awaited<ReturnType<FeedbackService['getPhotosByFeedbackID']>>
        })[] = await queryBuilder.getRawMany();
        for (const item of data) {
            item.photos = await this.getPhotosByFeedbackID(item.id, photoLimit, 0);
        }
        return data;
    }

    /**
     * 创建一条反馈
     * @param catID 猫咪ID,可为undefined则不指定猫咪
     * @param userID 用户ID
     * @param content 内容
     * @return 反馈ID
     */
    async createFeedback(type: FeedbackType, catID: number, userID: number, content: string, tokens: string[]) {
        const feedback = await this.feedbackRepository.insert({
            type: type,
            cat: {
                id: catID === undefined ? null : catID
            },
            user: {
                id: userID
            },
            content: content,
            progress: FeedbackProgress.PENDING
        });
        /* 插入图片 */
        for (const token of tokens) {
            await this.feedbackPhotoRepository.insert({
                feedback: {
                    id: feedback.identifiers[0].id
                },
                fileName: this.fileService.getFileNameByToken(token)
            });
        }
        return feedback.identifiers[0].id;
    }
}
