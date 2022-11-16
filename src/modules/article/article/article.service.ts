import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticlePhoto } from '../entities/article-photo.entity';
import { Article } from '../entities/article.entity';

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(Article)
        private articleRepository: Repository<Article>,
        @InjectRepository(ArticlePhoto)
        private articlePhotoRepository: Repository<ArticlePhoto>,
    ) {}

    /**
     * 根据文章ID获取图片集合
     * @param id 文章ID
     * @param isCover 是否为封面图
     * @returns 图片集合
     */
     async getPhotosByArticleID(id: number, isCover: boolean) {
        return await this.articlePhotoRepository.find({
            where: {
                article: {
                    id
                },
                isCover: isCover,
            },
            select: ['id', 'fileName']
        });
    }

    /**
     * 获取文章列表
     * @param limit 返回数量
     * @param start 开始位置
     * @returns 文章列表
     */
    async getArticlesList(limit: number, start: number) { 
        const articlesWithoutCover = await this.articleRepository.find({
            where: {
                canBeListed: true,
            },
            take: limit,
            skip: start,
            select: ['id', 'title', 'summary', 'url', 'createdDate'],
        }) as any;
        for (const item of articlesWithoutCover) {
            item.coverPhoto = (await this.getPhotosByArticleID(item.id, true))[0];
        }
        return articlesWithoutCover as {
            id: number;
            title: string;
            summary: string;
            url: string;
            createdDate: Date;
            coverPhoto: {
                id: number;
                fileName: string;
            }
        };
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
