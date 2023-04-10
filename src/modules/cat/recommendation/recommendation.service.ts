import { Injectable, Logger, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { SettingService } from 'src/modules/setting/setting/setting.service';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { CatService } from '../cat/cat.service';
import { CatRecommendation } from '../entities/cat-recommendation.entity';
import { Cat } from '../entities/cat.entity';

@Injectable()
export class RecommendationService implements OnApplicationBootstrap{
    private lastUpdateRecommandationCatsListTimeout: NodeJS.Timeout;
    private readonly logger = new Logger(RecommendationService.name);

    constructor(
        @InjectRepository(CatRecommendation)
        private catRecommendationRepository: Repository<CatRecommendation>,
        @InjectRepository(Cat)
        private catRepository: Repository<Cat>,
        @InjectEntityManager()
        private entityManager: EntityManager,
        private settingService: SettingService,
        private catService: CatService
    ) {}

    /**
     * 更新推荐列表
     * 
     */
    async updateRecommandationCatsList() {
        if (await this.settingService.getSetting("recommandations.default.algorithm") === 'random') {
            await this.updateDefaultRecommandationCatsListUsingRandom();
        }
        clearTimeout(this.lastUpdateRecommandationCatsListTimeout);
        this.lastUpdateRecommandationCatsListTimeout = setTimeout(() => this.updateRecommandationCatsList(), await this.settingService.getSetting("recommandations.default.interval") * 1000);
    }

    async onApplicationBootstrap() {
        if (await this.settingService.getSetting("recommandations.default.algorithm") === "") {
            await this.settingService.createSetting("recommandations.default.algorithm", 'random', false);
        }
        if (await this.settingService.getSetting("recommandations.default.interval") === "") {
            await this.settingService.createSetting("recommandations.default.interval", 3600, false);
        }
        this.catService.subscibreCatsInfoUpdatedEvent().subscribe(() => this.updateRecommandationCatsList());
        /* 计算一次推荐列表 */
        this.updateRecommandationCatsList();
    }

    /**
     * 通过用户ID获取推荐列表
     * @param id 用户ID,null为默认推荐列表
     * @param limit 限制数量
     * @param start 开始位置
     * @returns 用户推荐列表,形式[1,2,3]其中1,2,3是猫咪ID
     */
    async getRecommandationCatsListByUserID(id: number, limit: number, start: number) {
        const queryBuildinger = this.catRecommendationRepository.createQueryBuilder('list');
        queryBuildinger.andWhere({ user: { id: id === null ? IsNull() : id } });
        queryBuildinger.addOrderBy('id');
        queryBuildinger.select(['catId as catID']);
        queryBuildinger.take(limit);
        queryBuildinger.skip(start);
        const data = (await queryBuildinger.getRawMany()).map((x) => x.catID);
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
        let data: number[] | string = await this.getRecommandationCatsListByUserID(id, limit, start);
        if (data.length === 0) {
            data = await this.getRecommandationCatsListByUserID(null, limit, start);
        }
        /* 说明两个列表都不存在 */
        if (data.length == 0) {
            throw new NotFoundException('No recommandation cats list found.');
        }
        /* 因为ID已经是裁剪过的,所以无需进一步裁减 */
        return await this.catService.getCatsListByIDs(data, limit, 0);
    }

    /**
     * 使用随机数更新默认推荐列表
     */
    private async updateDefaultRecommandationCatsListUsingRandom() {
        this.logger.log('Updating default recommandation cats list using random...');
        const queryBuildinger = this.catRepository.createQueryBuilder('cat');
        queryBuildinger.orderBy('RAND()');
        queryBuildinger.select(['id']);
        const data = await queryBuildinger.getRawMany();
        await this.entityManager.transaction(async (manager) => {
            await manager.delete(CatRecommendation, { user: IsNull() });
            for (let i = 0; i < data.length; i++) {
                await manager.insert(CatRecommendation, {
                    cat: { id: data[i].id },
                    user: { id: null }
                });
            }
        });
        this.logger.log('Updated default recommandation cats list using random successfully.');
    }
}
