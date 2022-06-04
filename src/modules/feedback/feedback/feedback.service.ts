import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileService } from 'src/modules/file/file/file.service';
import { Repository } from 'typeorm';
import { FeedbackPhoto } from '../entities/feedback-photo.entity';
import { Feedback } from '../entities/feedback.entity';
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
     * 创建一条反馈
     * @param catID 猫咪ID,可为undefined则不指定猫咪
     * @param userID 用户ID
     * @param content 内容
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
            content: content
        });
        /* 插入图片 */
        for (const token of tokens) {
            await this.feedbackPhotoRepository.insert({
                feedback: {
                    id: feedback.raw.insertId
                },
                fileName: this.fileService.getFileNameByToken(token)
            });
        }
    }
}
