import { CatRecommendation } from 'src/modules/cat/entities/cat-recommendation.entity';
import { UserLog } from 'src/modules/user-log/entities/user-log.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany, Index, } from 'typeorm';
import { Role } from '../enums/role.enum';
import { PointsTransaction } from './points-transaction.entity';
import { CatPhoto } from 'src/modules/cat/entities/cat-photo.entity';
import { UserAchievement } from './user-achievement.entity';
import { Comment } from 'src/modules/comment/entities/comment.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    /** 微信开放ID */
    @Index()
    @Column({ nullable: true })
    openID: string;

    /** 微信联盟ID */
    @Index()
    @Column({ nullable: true })
    unionID: string;

    /** 用户昵称 */
    @Column({ nullable: true })
    nickName: string;

    /** 用户头像文件ID */
    @Column({ nullable: true })
    avatarFileName: string;

    /** 用户角色 */
    @Column({
        type: 'enum',
        enum: Role,
        default: Role.NormalUser,
        nullable: false,
    })
    role: Role;

    /** 积分  */
    @Column({ default: 0 })
    points: number;

    /** 积分变化记录  */
    @OneToMany(() => PointsTransaction, (pointsTransaction) => pointsTransaction.user)
    pointsTransaction: PointsTransaction;

    /** 猫咪推荐表  */
    @OneToMany(() => CatRecommendation, (catRecommendations) => catRecommendations.user)
    catRecommendations: CatRecommendation[];

    /** 用户上传的照片 */
    @OneToMany(() => CatPhoto, (catPhoto) => catPhoto.user)
    photos: CatPhoto[];

    /** 用户操作日记 */
    @OneToMany(() => UserLog, (userLog) => userLog.user)
    logs: UserLog[];

    /** 用户成就 */
    @OneToMany(() => UserAchievement, (userAchievement) => userAchievement.user)
    achievements: UserAchievement[];

    /** 发表的评论  */
    @OneToMany(() => Comment, (comment) => comment.user)
    comments: Comment[];

    /** 上一次登陆时间 */
    @Column()
    lastLoginDate: Date;

    @CreateDateColumn()
    createdDate: Date;
}
