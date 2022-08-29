import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { ApiException } from 'src/exceptions/api.exception';
import { Error } from 'src/exceptions/enums/error.enum';
import { EntityManager, Repository } from 'typeorm';
import { PointsTransaction } from '../entities/points-transaction.entity';
import { User } from '../entities/user.entity';
import { PointsTransactionReason } from '../enums/points-transaction-reason.enum';

@Injectable()
export class PointsService {
    constructor(
        @InjectRepository(PointsTransaction)
        private pointsTransactionRepository: Repository<PointsTransaction>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectEntityManager()
        private entityManager: EntityManager,
    ) {}

    /**
     * 获取积分变化记录
     * @param userID 用户ID
     * @param limit 限制数量
     * @param start 开始位置
     * @returns 积分变化记录
     */
    async getPointsTransaction(userID: number, limit: number, start: number) {
        return this.pointsTransactionRepository.find({
            where: {
                user: {
                    id: userID,
                },
            },
            select: ['createdDate', 'description', 'points', 'reason', 'id'],
            take: limit,
            skip: start,
        }) as any as Pick<PointsTransaction, 'createdDate' | 'description' | 'points' | 'reason' | 'id'>[];
    }

    /**
     * 获取降序排行的积分榜
     * @param limit 限制数量
     * @param start 开始位置
     * @returns 积分榜
     */
    async getPointsRankingInDescending(limit: number, start: number) {
        return this.userRepository.find({
            select: ['avatarFileName', 'id', 'nickName', 'points'],
            order: {
                points: 'DESC',
            },
            take: limit,
            skip: start,
        }) as any as Pick<User, 'avatarFileName' | 'id' | 'nickName' | 'points'>[];
    }

    /**
     * 增减积分
     * @param userID 用户ID
     * @param points 增减积分数,正数为增加,负数为扣减
     * @param reason 增减原因类型
     * @param description 增减原因描述
     * @param manager 数据库Manager对象,若存在,则本方法执行后不会自动提交事务,不存在则本方法会创建一个事务并自动提交
     */
    async changePoints(userID: number, points: number, reason: PointsTransactionReason, description: string, manager?: EntityManager) {
        const func = async (transactionalEntityManager: EntityManager) => {
            const pointsTrans = transactionalEntityManager.getRepository(PointsTransaction);
            const user = await transactionalEntityManager
                .getRepository(User)
                .findOne({
                    where: { id: userID },
                    select: ['points'],
                });
            if (user === undefined) throw new NotFoundException('User not found');
            if (user.points + points < 0) throw new ApiException(Error.POINTS_NOT_ENOUGH);
            transactionalEntityManager.update(User, userID, { points: user.points + points });
            await pointsTrans.save({
                user: {
                    id: userID,
                },
                reason: reason,
                points: points,
                description: description,
            });
        };
        if (manager === undefined) {
            await this.entityManager.transaction(func);
        } else {
            await func(manager);
        }
    }
}
