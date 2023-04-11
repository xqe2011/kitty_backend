import { Body, Controller, Delete, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/modules/user/enums/role.enum';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, } from '@nestjs/swagger';
import { ManageLogService } from '../manage-log/manage-log.service';
import { ManageLogType } from '../enums/manage-log-type.enum';
import { CreateArticleResponseDto } from '../dtos/create-article.response';
import { CreateArticleBodyDto } from '../dtos/create-article.body';
import { ArticleService } from 'src/modules/article/article/article.service';
import { DeleteArticleResponseDto } from '../dtos/delete-article.response';
import { DeleteArticleParamDto } from '../dtos/delete-article.param';
import { AddPhotoToArticleResponseDto } from '../dtos/add-photo-to-article.response';
import { AddPhotoToArticleParamDto } from '../dtos/add-photo-to-article.param';
import { AddPhotoToArticleBodyDto } from '../dtos/add-photo-to-article.body';
import { UpdateArticleResponseDto } from '../dtos/update-article.response';
import { UpdateArticleParamDto } from '../dtos/update-article.param';
import { UpdateArticleBodyDto } from '../dtos/update-article.body';
import { UpdateArticlePhotoResponseDto } from '../dtos/update-article-photo.response';
import { UpdateArticlePhotoParamDto } from '../dtos/update-article-photo.param';
import { UpdateArticlePhotoBodyDto } from '../dtos/update-article-photo.body';
import { DeleteArticlePhotoResponseDto } from '../dtos/delete-article-photo.response';
import { DeleteArticlePhotoParamDto } from '../dtos/delete-article-photo.param';

@Controller('/manage')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.Admin)
@ApiBearerAuth()
@ApiTags('管理')
export class ArticleController {
    constructor(
        private articleService: ArticleService,
        private manageLogService: ManageLogService
    ) { }

    @Post('articles')
    @ApiOperation({
        summary: '创建文章',
        description: '创建文章,需要管理员权限'
    })
    @ApiOkResponse({
        description: '创建成功',
        type: CreateArticleResponseDto
    })
    async createArticle(@Req() request, @Body() body: CreateArticleBodyDto) {
        const data = { id: await this.articleService.createArticle(body.title, body.summary, body.url) };
        await this.manageLogService.writeLog(request.user.id, ManageLogType.CREATE_ARTICLE, { ...body, ...data });
        return data;
    }

    @Delete('article/:id')
    @ApiOperation({
        summary: '删除文章',
        description: '删除文章,需要管理员权限'
    })
    @ApiOkResponse({
        description: '删除成功',
        type: DeleteArticleResponseDto
    })
    async deleteArticle(@Req() request, @Param() param: DeleteArticleParamDto) {
        await this.articleService.deleteArticle(param.id);
        await this.manageLogService.writeLog(request.user.id, ManageLogType.DELETE_ARTICLE, { ...param });
        return {};
    }

    @Post('article/:id/photos')
    @ApiOperation({
        summary: '添加照片到文章',
        description: '添加照片到文章,需要管理员权限'
    })
    @ApiOkResponse({
        description: '添加成功',
        type: AddPhotoToArticleResponseDto
    })
    async addPhotoToArticle(@Req() request, @Param() param: AddPhotoToArticleParamDto, @Body() body: AddPhotoToArticleBodyDto) {
        const data = { id: await this.articleService.addPhotoToArticle(param.id, body.fileToken) };
        await this.manageLogService.writeLog(request.user.id, ManageLogType.ADD_PHOTO_TO_ARTICLE, { ...param, ...body, ...data });
        return data;
    }

    @Put('article/:id')
    @ApiOperation({
        summary: '修改文章信息',
        description: '修改文章信息,需要管理员权限'
    })
    @ApiOkResponse({
        description: '修改成功',
        type: UpdateArticleResponseDto
    })
    async updateArticle(@Req() request, @Param() param: UpdateArticleParamDto, @Body() body: UpdateArticleBodyDto) {
        await this.articleService.updateArticle(param.id, body.title, body.summary, body.url);
        await this.manageLogService.writeLog(request.user.id, ManageLogType.UPDATE_ARTICLE, { ...param, ...body });
        return {};
    }

    @Put('article/photo/:id')
    @ApiOperation({
        summary: '修改文章照片信息',
        description: '修改文章照片信息,需要管理员权限'
    })
    @ApiOkResponse({
        description: '修改成功',
        type: UpdateArticlePhotoResponseDto
    })
    async updatePhoto(@Req() request, @Param() param: UpdateArticlePhotoParamDto, @Body() body: UpdateArticlePhotoBodyDto) {
        await this.articleService.updateArticlePhoto(param.id, body.isCover);
        await this.manageLogService.writeLog(request.user.id, ManageLogType.UPDATE_ARTICLE_PHOTO, { ...param, ...body });
        return {};
    }

    @Delete('article/photo/:id')
    @ApiOperation({
        summary: '删除文章照片',
        description: '删除文章照片,需要管理员权限'
    })
    @ApiOkResponse({
        description: '删除成功',
        type: DeleteArticlePhotoResponseDto
    })
    async deletePhoto(@Req() request, @Param() param: DeleteArticlePhotoParamDto) {
        await this.articleService.deletePhoto(param.id);
        await this.manageLogService.writeLog(request.user.id, ManageLogType.DELETE_ARTICLE_PHOTO, { ...param });
        return {};
    }

}
