import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SettingService } from 'src/modules/setting/setting/setting.service';
import { User } from 'src/modules/user/entities/user.entity';
import { UsersService } from 'src/modules/user/user/users.service';
import { IsNull, Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { CommentsArea } from '../entities/comments-area.entity';
import { CommentStatus } from '../enums/comment-status.enum';

@Injectable()
export class CommentService implements OnApplicationBootstrap{
    constructor(
        @InjectRepository(Comment)
        private commentRepository: Repository<Comment>,
        private usersService: UsersService,
        private settingService: SettingService
    ) {}

    async onApplicationBootstrap() {
        if (await this.settingService.getSetting("comment.censor") === "") {
            await this.settingService.createSetting("comment.censor", true, true);
        }
    }

    /**
     * 根据父评论ID获取评论
     * @param parentID 父评论ID
     * @param limit 限制数量
     * @param start 开始位置
     * @returns 评论数组
     */
    async getCommentsByParentID(parentID: number, limit: number, start: number) {
        const queryBuildinger = this.commentRepository.createQueryBuilder('comment');
        queryBuildinger.andWhere({
            status: CommentStatus.DISPLAY,
            parentComment: { id: parentID }
        });
        queryBuildinger.skip(start);
        queryBuildinger.take(limit);
        queryBuildinger.select([
            'comment.id',
            'comment.conversationID',
            'comment.content',
            'comment.createdDate',
        ]);
        return await queryBuildinger.getMany();
    }

    /**
     * 根据讨论ID获取评论
     * @param conversationID 讨论ID
     * @param limit 限制数量
     * @param start 开始位置
     * @returns 评论数组
     */
    async getCommentsByConversationID(conversationID: number, limit: number, start: number) {
        const queryBuildinger = this.commentRepository.createQueryBuilder('comment');
        queryBuildinger.andWhere({
            status: CommentStatus.DISPLAY,
            conversationID
        });
        queryBuildinger.skip(start);
        queryBuildinger.take(limit);
        queryBuildinger.select([
            'comment.id',
            'comment.conversationID',
            'comment.content',
            'comment.createdDate',
        ]);
        return await queryBuildinger.getMany();
    }

    /**
     * 根据评论区ID有限制数量的返回根评论内容
     * @param areaID 评论区ID
     * @param rootLimit 限制数量,针对一级评论
     * @param rootStart 开始位置,针对一级评论
     * @param childrenLimit 限制数量,针对二级评论
     * @returns 评论信息
     */
    async getCommentsByAreaID(areaID: number, rootLimit: number, rootStart: number, childrenLimit: number) {
        const queryBuildinger = this.commentRepository.createQueryBuilder('comment');
        queryBuildinger.andWhere({
            area: { id: areaID },
            parentComment: { id: IsNull() },
            status: CommentStatus.DISPLAY,
        });
        queryBuildinger.skip(rootStart);
        queryBuildinger.take(rootLimit);
        queryBuildinger.select([
            'comment.id',
            'comment.conversationID',
            'comment.content',
            'comment.createdDate',
        ]);
        const output: (Pick<Comment, 'id' | 'conversationID' | 'content' | 'createdDate'> & {
            childrenTotal: number;
            childrenComments: Pick<Comment, 'id' | 'conversationID' | 'content' | 'createdDate'>[];
        })[] = await queryBuildinger.getMany() as any;
        for (const val of output) {
            val.childrenTotal = await this.commentRepository.count({ parentComment: { id: val.id } });
            val.childrenComments = (childrenLimit === 0 ? [] : await this.getCommentsByParentID(val.id, childrenLimit, 0));
        }
        return output;
    }

    /**
     * 插入评论,会自动根据是否启用审核填充对应的类型
     * @param userID 用户ID
     * @param areaID 评论区ID
     * @param parentID 父评论ID,可为空,若不为空,则父评论必须没有父评论
     * @param conversationID 对话ID,可为空
     * @param content 评论内容
     */
    async createComment(userID: number, areaID: number, parentID: number | null, conversationID: number | null, content: string) {
        let comment = new Comment();
        if (parentID != null) {
            comment.parentComment = new Comment();
            comment.parentComment.id = parentID;
        }
        comment.area = new CommentsArea();
        comment.area.id = areaID;
        comment.user = new User();
        comment.user.id = userID;
        const enableCensor = await this.settingService.getSetting("comment.censor");
        comment.status = enableCensor ? CommentStatus.PENDING : CommentStatus.DISPLAY;
        comment.content = content;
        /**
         * 先保存,如果该评论属于某个对话,那就再更新
         * 好处是如果不属于某个对话,我们需要给他赋值一个唯一的conversationID,那直接使用主键即可,不会因为自增字段带来表锁
         * @TODO 或许还有改进空间
         */
        comment = await this.commentRepository.save(comment);
        comment.conversationID = (conversationID === null ? comment.id : conversationID);
        await this.commentRepository.update(
            { id: comment.id },
            { conversationID: comment.conversationID },
        );
    }

    /**
     * 删除评论
     * @param id 评论ID
     */
    async deleteComment(id: number) {
        const childrenComments = (
            await this.commentRepository.findOne(id, { relations: ['childrenComments'] })
        ).childrenComments;
        for (const childrenComment of childrenComments) {
            await this.deleteComment(childrenComment.id);
        }
        await this.commentRepository.softDelete(id);
    }

    /**
     * 判断某评论ID是否属于某用户
     * @param id 评论ID
     * @param userID 用户ID
     * @returns 是否属于
     */
    async isCommentBelongToUser(id: number, userID: number) {
        if (!this.usersService.isUserExists(userID)) return false;
        return (await this.commentRepository.count({
            id: id,
            user: { id: userID },
        })) > 0;
    }

    /**
     * 判断评论ID是否存在
     * @param id 评论区ID
     * @returns 是否存在
     */
    async isCommentExists(id: number) {
        return (await this.commentRepository.count({ id: id })) > 0;
    }

    /**
     * 判断评论ID是否存在并属于一级评论
     * @param id 评论区ID
     * @param isRoot 是否检查是不是一级评论
     * @returns 是否存在并属于
     */
    async isCommentRoot(id: number) {
        return (await this.commentRepository.count({
            id: id,
            parentComment: {
                id: IsNull(),
            },
        })) > 0;
    }

    /**
     * 获取所有评论,默认按照时间倒序
     * @returns 评论
     */
     async getComments(limit: number, start: number) {
        const queryBuilder = this.commentRepository.createQueryBuilder('comment');
        queryBuilder.skip(start);
        queryBuilder.take(limit);
        queryBuilder.select(['id', 'conversationID', 'status', 'createdDate', 'content', 'areaId as areaID', 'parentCommentId as parentCommentID', 'userId as userID']);
        queryBuilder.orderBy("createdDate", "DESC");
        const data = await queryBuilder.getRawMany();
        return data as (Pick<Comment, 'id' | 'createdDate' | 'content' | 'conversationID' | 'status'> & { userID: number, parentCommentID: number, areaID: number })[];
    }

    /**
     * 更新评论信息
     * @param id 评论ID
     * @param status 评论状态
     */
    async updateCommentInfo(id: number, status: CommentStatus) {
        await this.commentRepository.update(id, { status });
    }

    /**
     * 删除评论
     *
     * @param id 评论ID
     */
    async deletePhoto(id: number) {
        await this.commentRepository.softDelete(id);
    }
}
