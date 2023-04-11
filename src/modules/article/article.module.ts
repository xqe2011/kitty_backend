import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleController } from './article/article.controller';
import { ArticleService } from './article/article.service';
import { ArticlePhoto } from './entities/article-photo.entity';
import { Article } from './entities/article.entity';
import { IsArticlePhotoIDValidValidator } from './validators/is-article-photoid-valid.validator';
import { IsArticleIDValidValidator } from './validators/is-articleid-valid.validator';

@Module({
    imports: [TypeOrmModule.forFeature([Article, ArticlePhoto])],
    controllers: [ArticleController],
    providers: [ArticleService, IsArticleIDValidValidator, IsArticlePhotoIDValidValidator],
    exports: [ArticleService]
})
export class ArticleModule {}
