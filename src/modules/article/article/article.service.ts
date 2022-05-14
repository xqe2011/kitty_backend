import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileService } from 'src/modules/file/file/file.service';
import { Repository } from 'typeorm';
import { Article } from '../entities/article.entity';

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(Article)
        private articleRepository: Repository<Article>,
        private fileService: FileService,
    ) {}

    /**
     * 通过文章ID获取信息
     * @param id 文章ID
     * @returns 文章信息
     */
    async getArticle(id: number) {
        const queryBuildinger = this.articleRepository.createQueryBuilder();
        queryBuildinger.andWhere('id = :id', { id: id });
        queryBuildinger.select([
            'content',
            'id',
            'title',
            'coverFileName',
            'createdDate',
            'summary'
        ]);
        return (await queryBuildinger.getRawOne()) as Pick<Article, 'content' | 'id' | 'title' | 'createdDate' | 'summary' | 'coverFileName'>;
    }

    /**
     * 获取文章列表
     * @param limit 返回数量
     * @param start 开始位置
     * @returns 文章列表
     */
    async getArticlesList(limit: number, start: number) {
        return await this.articleRepository.find({
            where: {
                canBeListed: true,
            },
            take: limit,
            skip: start,
            select: ['id', 'coverFileName', 'title', 'summary'],
        });
    }

    /**
     * 检查文章存在
     * @param id 猫咪ID
     * @returns 猫咪信息
     */
    async isArticleExists(id: number) {
        return (
            (await this.articleRepository.count({
                where: {
                    id: id,
                },
            })) > 0
        );
    }
}
