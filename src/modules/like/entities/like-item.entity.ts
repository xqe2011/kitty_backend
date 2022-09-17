import { User } from 'src/modules/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, DeleteDateColumn, ManyToOne, Index } from 'typeorm';
import { LikeableEntity } from './likeable-entity.entity';

@Entity()
export class LikeItem {
    @PrimaryGeneratedColumn()
    id: number;

    /** 所属的点赞列表 */
    @Index()
    @ManyToOne(() => LikeableEntity, (likeableEntity) => likeableEntity.items, { nullable: false })
    entity: LikeableEntity;

    /** 所属用户  */
    @ManyToOne(() => User, (user) => user.likes, { nullable: false })
    user: User;

    @CreateDateColumn()
    createdDate: Date;

    @DeleteDateColumn()
    deleteDate: Date;
}
