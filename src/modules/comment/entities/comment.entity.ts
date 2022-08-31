import { User } from 'src/modules/user/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, DeleteDateColumn, OneToMany, ManyToOne, Index } from 'typeorm';
import { CommentStatus } from '../enums/comment-status.enum';
import { CommentsArea } from './comments-area.entity';

@Entity()
export class Comment {
    @PrimaryGeneratedColumn()
    id: number;

    /** 所属的评论区 */
    @Index()
    @ManyToOne(() => CommentsArea, (commentsArea) => commentsArea.comments, {
        nullable: false,
    })
    area: CommentsArea;

    /** 父评论  */
    @Index()
    @ManyToOne(() => Comment, (comment) => comment.childrenComments)
    parentComment: Comment;

    /** 子评论  */
    @OneToMany(() => Comment, (comment) => comment.parentComment)
    childrenComments: Comment[];

    /** 评论状态 */
    @Column({
        type: 'enum',
        enum: CommentStatus,
        default: CommentStatus.PENDING,
        nullable: false,
    })
    status: CommentStatus;

    /** 对话ID  */
    @Index()
    @Column({ default: null })
    conversationID: number;

    /** 所属用户  */
    @ManyToOne(() => User, (user) => user.comments, { nullable: false })
    user: User;

    /** 评论内容 */
    @Column({ nullable: false })
    content: string;

    @CreateDateColumn()
    createdDate: Date;

    @DeleteDateColumn()
    deleteDate: Date;
}
