import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index, ManyToOne, } from 'typeorm';
import { PointsTransactionReason } from '../enums/points-transaction-reason.enum';
import { User } from './user.entity';

@Entity()
export class PointsTransaction {
    @PrimaryGeneratedColumn()
    id: number;

    /** 用户信息 */
    @Index()
    @ManyToOne(() => User, (user) => user.pointsTransaction, { nullable: false })
    user: User;

    /** 原因 */
    @Column({
        type: 'enum',
        enum: PointsTransactionReason,
        nullable: false,
    })
    reason: PointsTransactionReason;

    /** 变化的积分数,正数为增加,负数为减少  */
    @Column({ nullable: false })
    points: number;

    /** 变化记录描述  */
    @Column({ nullable: false })
    description: string;

    @CreateDateColumn()
    createdDate: Date;
}
