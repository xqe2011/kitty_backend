import { Entity, Column, PrimaryGeneratedColumn, DeleteDateColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { LikeItem } from './like-item.entity';

@Entity()
export class LikeableEntity {
    @PrimaryGeneratedColumn()
    id: number;

    /** 是否展示 */
    @Column({ nullable: false })
    isDisplay: boolean;

    /** 是否允许同一个用户多次点赞 */
    @Column({ nullable: false })
    allowDuplicateLike: boolean;

    /** 对应的点赞 */
    @OneToMany(() => LikeItem, (likeItem) => likeItem.entity)
    items: LikeItem[];

    @CreateDateColumn()
    createdDate: Date;

    @DeleteDateColumn()
    deleteDate: Date;
}
