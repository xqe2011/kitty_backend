import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/modules/user/enums/role.enum';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { ArticleService } from './article.service';
import { GetArticleParamDto } from '../dtos/get-article.param';
import { GetArticlesQueryDto } from '../dtos/get-articles.query';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, } from '@nestjs/swagger';
import { GetArticlesResponseDto } from '../dtos/get-articles.response';
import { GetArticleResponseDto } from '../dtos/get-article.response';

@Controller('/')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
@ApiTags('公告和文章')
export class ArticleController {
    constructor(
        private articleService: ArticleService
    ) {}

    @Get('/articles')
    @Roles(Role.NormalUser, Role.RegisteredUser, Role.Admin)
    @ApiOperation({ summary: '获取文章列表' })
    @ApiOkResponse({
        description: '获取成功',
        type: GetArticlesResponseDto,
        isArray: true,
    })
    async getArticleList(@Query() query: GetArticlesQueryDto) {
        return this.articleService.getArticlesList(query.limit, query.start);
    }

    @Get('/article/:id')
    @Roles(Role.NormalUser, Role.RegisteredUser, Role.Admin)
    @ApiOperation({ summary: '获取文章信息' })
    @ApiOkResponse({
        description: '获取成功',
        type: GetArticleResponseDto,
    })
    async getArticle(@Param() param: GetArticleParamDto) {
        return this.articleService.getArticle(param.id);
    }
}
