import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Index, UpdateDateColumn, CreateDateColumn, } from 'typeorm';
import { Achievement } from './achievement.entity';
import { User } from './user.entity';

@Entity()
export class UserAchievement {
    @PrimaryGeneratedColumn()
    id: number;

    /** 用户信息 */
    @Index()
    @ManyToOne(() => User, (user) => user.achievements, { nullable: false })
    user: User;

    /** 对应的成就 */
    @Index()
    @ManyToOne(() => Achievement, (achievement) => achievement.userAchievements, { nullable: false })
    achievement: Achievement;

    /** 完成百分比 */
    @Column({ default: 0 })
    percent: number;

    @CreateDateColumn()
    createdDate: Date;

    @UpdateDateColumn()
    updatedDate: Date;
}
