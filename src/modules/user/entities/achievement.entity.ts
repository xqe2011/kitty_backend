import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany, } from 'typeorm';
import { UserAchievement } from './user-achievement.entity';

@Entity()
export class Achievement {
    @PrimaryGeneratedColumn()
    id: number;

    /** 成就描述  */
    @Column({ nullable: false })
    description: string;

    /** 该成就是否启用 */
    @Column({ default: true })
    enable: boolean;

    /** 用户成就状态 */
    @OneToMany(() => UserAchievement, (userAchievement) => userAchievement.achievement)
    userAchievements: UserAchievement[];

    @CreateDateColumn()
    createdDate: Date;
}
