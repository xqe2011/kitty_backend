import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleController } from './article/article.controller';
import { ArticleService } from './article/article.service';
import { Article } from './entities/article.entity';
import { IsArticleIDValidValidator } from './validators/is-articleid-valid.validator';

@Module({
    imports: [TypeOrmModule.forFeature([Article])],
    controllers: [ArticleController],
    providers: [ArticleService, IsArticleIDValidValidator],
})
export class ArticleModule {}
