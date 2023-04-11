import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { FileService } from 'src/modules/file/file/file.service';
import { EntityManager, Repository } from 'typeorm';
import { ArticlePhoto } from '../entities/article-photo.entity';
import { Article } from '../entities/article.entity';

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(Article)
        private articleRepository: Repository<Article>,
        @InjectRepository(ArticlePhoto)
        private articlePhotoRepository: Repository<ArticlePhoto>,
        @InjectEntityManager()
        private entityManager: EntityManager,
        private fileService: FileService
    ) {}

    /**
     * 创建文章
     * @param title 文章标题
     * @param summary 文章摘要
     * @param url 文章链接
     * @retrun 文章ID
     */
    async createArticle(title: string, summary: string, url: string) {
        return await this.entityManager.transaction(async manager => {
            const article = new Article();
            article.title = title;
            article.summary = summary;
            article.url = url;
            const result = await manager.save(article);
            return result.id;
        });
    }

    /**
     * 更新文章照片信息
     * @param id 照片ID
     * @param isCover 照片是否为封面
     */
    async updateArticlePhoto(id: number, isCover: boolean) {
        await this.articlePhotoRepository.update({ id }, { isCover });
    }

    /**
     * 更新文章信息
     * @param id 文章ID
     * @param title 文章标题
     * @param summary 文章摘要
     * @param url 文章链接
     */
    async updateArticle(id: number, title: string, summary: string, url: string) {
        await this.articleRepository.update({ id }, { title, summary, url });
    }

    /**
     * 将照片添加到文章
     * @param id 文章ID
     * @param fileToken 照片文件Token
     * @returns 照片ID
     */
    async addPhotoToArticle(id: number, fileToken: string) {
        const photo = new ArticlePhoto();
        photo.article = { id } as any;
        photo.fileName = this.fileService.getFileNameByToken(fileToken);
        await this.articlePhotoRepository.save(photo);
        return photo.id;
    }

    /**
     * 根据文章ID删除对应的照片集
     * @param id 照片ID
     * @param manager 事务,不传入则不使用事务写
     */
    async deletePhoto(id: number, manager?: EntityManager) {
        const entityManager = manager || this.entityManager;
        await entityManager.softDelete(ArticlePhoto, { id });
    }

    /**
     * 删除文章
     * @param id 文章ID
     */
    async deleteArticle(id: number) {
        await this.entityManager.transaction(async manager => {
            await manager.softDelete(ArticlePhoto, { article: { id } });
            await manager.softDelete(Article, { id });
        });
    }

    /**
     * 文章照片是否存在
     * @param id 照片ID
     * @returns 是否存在
     */
    async isArticlePhotoExists(id: number) {
        return (await this.articlePhotoRepository.count({ id: id })) > 0;
    }

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
