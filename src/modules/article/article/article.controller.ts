import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/modules/user/enums/role.enum';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { ArticleService } from './article.service';
import { GetArticlesQueryDto } from '../dtos/get-articles.query';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, } from '@nestjs/swagger';
import { GetArticlesResponseDto } from '../dtos/get-articles.response';

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
}
