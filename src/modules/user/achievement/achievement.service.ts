import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement } from '../entities/achievement.entity';

@Injectable()
export class AchievementService {
    constructor(
        @InjectRepository(Achievement)
        private achievementRepository: Repository<Achievement>
    ) {}

    /**
     * 获取用户成就和完成情况
     * @param userID 用户ID
     * @returns 用户成就和完成情况
     */
    async getUserAchievements(userID: number) {
        const queryBuildinger = this.achievementRepository.createQueryBuilder('achievement');
        queryBuildinger.leftJoinAndSelect('achievement.userAchievements', 'ua', 'ua.userId = :id', { id: userID });
        queryBuildinger.andWhere({ enable: true });
        queryBuildinger.select([
            'achievement.id as id',
            'achievement.description as description',
            'ua.percent as percent',
            'ua.updatedDate as updatedDate',
        ]);
        let data = await queryBuildinger.getRawMany();
        data = data.map((v) => {
            v.percent = v.percent === null ? 0 : v.percent;
            v.updatedDate = v.updatedDate == null ? new Date() : v.updatedDate;
            return v;
        });
        return data as {
            id: number;
            description: string;
            percent: number;
            updatedDate: Date;
        }[];
    }
}
