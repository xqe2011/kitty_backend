import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SettingService } from 'src/modules/setting/setting/setting.service';
import { Repository } from 'typeorm';
import { CatService } from '../cat/cat.service';
import { CatRecommendation } from '../entities/cat-recommendation.entity';

@Injectable()
export class RecommendationService {
    constructor(
        @InjectRepository(CatRecommendation)
        private catRecommendationRepository: Repository<CatRecommendation>,
        private settingService: SettingService,
        private catService: CatService
    ) {}

    /**
     * 通过用户ID获取推荐列表
     * @param id 用户ID
     * @returns 用户推荐列表,形式[1,2,3]其中1,2,3是猫咪ID
     */
    async getRecommandationCatsListByUserID(id: number) {
        const queryBuildinger = this.catRecommendationRepository.createQueryBuilder('list');
        queryBuildinger.andWhere({ user: { id: id } });
        queryBuildinger.addOrderBy('id');
        queryBuildinger.select(['catId as catID']);
        const data = (await queryBuildinger.getRawMany()).map((x) => x.catID);
        if (data === undefined || data.length === 0) {
            return undefined;
        }
        return data as number[];
    }

    /**
     * 获取该用户的推荐列表,若不存在则返回默认列表
     * @param id 用户ID
     * @param limit 限制数量
     * @param start 开始位置
     * @returns 推荐列表,形式[1,2,3]其中1,2,3是猫咪ID
     */
    async getUserRecommandationCatsList(id: number, limit: number, start: number) {
        let data: number[] | string = await this.getRecommandationCatsListByUserID(id);
        if (data === undefined) {
            data = await this.settingService.getSetting("recommandations.default");
        }
        if (typeof data != "object") {
            throw new NotFoundException("Recommandation List not found.");
        }
        return await this.catService.getCatsListByIDs(data, limit, start);
    }
}
