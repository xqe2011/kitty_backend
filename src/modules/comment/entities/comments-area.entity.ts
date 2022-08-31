import { Entity, Column, PrimaryGeneratedColumn, DeleteDateColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { Comment } from './comment.entity';

@Entity()
export class CommentsArea {
    @PrimaryGeneratedColumn()
    id: number;

    /** 是否展示 */
    @Column({ nullable: false })
    isDisplay: boolean;

    /** 对应的评论 */
    @OneToMany(() => Comment, (comment) => comment.area)
    comments: Comment[];

    @CreateDateColumn()
    createdDate: Date;

    @DeleteDateColumn()
    deleteDate: Date;
}
