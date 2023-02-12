import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SettingService } from 'src/modules/setting/setting/setting.service';
import { User } from 'src/modules/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Report } from '../entities/report.entity';
import { ReportEntityType } from '../enums/report-entity-type.enum';
import { ReportType } from '../enums/report-type.enum';

@Injectable()
export class ReportService implements OnApplicationBootstrap{
    constructor(
        @InjectRepository(Report)
        private reportRepository: Repository<Report>,
        private settingService: SettingService
    ) {}

    async onApplicationBootstrap() {
        if (await this.settingService.getSetting("report.interval") === "") {
            await this.settingService.createSetting("report.interval", 30 * 24 * 60 * 60, false);
        }
        if (await this.settingService.getSetting("report.threshold") === "") {
            await this.settingService.createSetting("report.threshold", 10, false);
        }
    }

    /**
     * 创建举报
     *
     * @param userID 用户ID
     * @param entityType 关联的实体类型
     * @param entityID 关联的实体ID
     * @param type 举报类型
     * @param content 举报内容
     * @returns 举报ID
     */
    async createReport(userID: number, entityType: ReportEntityType, entityID: number, type: ReportType, content: string) {
        const report = new Report();
        report.user = new User();
        report.user.id = userID;
        report.entityType = entityType;
        report.entityID = entityID;
        report.type = type;
        report.content = content;
        return (await this.reportRepository.insert(report)).identifiers[0].id;
    }

    /**
     * 根据用户ID查询举报列表
     *
     * @param userID 用户ID
     * @param limit 限制数量
     * @param start 开始位置
     * @returns 
     */
    async getReportsByUserID(userID: number, limit: number, start: number) {
        const queryBuilder = this.reportRepository.createQueryBuilder('report');
        queryBuilder.skip(start);
        queryBuilder.take(limit);
        queryBuilder.where({ user: { id: userID } });
        queryBuilder.select(['id', 'entityType', 'entityID', 'type', 'content', 'createdDate']);
        queryBuilder.orderBy("createdDate", "DESC");
        return (await queryBuilder.getRawMany()) as Pick<Report, 'id' | 'entityType' | 'entityID' | 'type' | 'content' | 'createdDate'>[];
    }

    /**
     * 根据实体信息查询举报列表
     *
     * @param entityType 关联的实体类型
     * @param entityID 关联的实体ID
     * @returns 举报列表
     */
    async getReportsByEntity(entityType: ReportEntityType, entityID: number, limit: number, start: number) {
        const queryBuilder = this.reportRepository.createQueryBuilder('report');
        queryBuilder.skip(start);
        queryBuilder.take(limit);
        queryBuilder.where({ entityType, entityID });
        queryBuilder.select(['id', 'type', 'content', 'createdDate', 'userId as userID']);
        queryBuilder.orderBy("createdDate", "DESC");
        return (await queryBuilder.getRawMany()) as (Pick<Report, 'id' | 'type' | 'content' | 'createdDate'> & { userID: number })[];
    }

    /**
     * 获取一定时间内举报数量超过阈值的实体列表,默认时间降序排列
     * 
     * @param entityType 关联的实体类型
     * @param limit 限制数量
     * @param start 开始位置
     * @returns 
     */
    async getEntitiesExceedReportThreshold(entityType: ReportEntityType, limit: number, start: number) {
        const queryBuilder = this.reportRepository.createQueryBuilder('report');
        queryBuilder.skip(start);
        queryBuilder.take(limit);
        queryBuilder.andWhere({ entityType })
        queryBuilder.andWhere('createdDate  > DATE_SUB(NOW(), INTERVAL :second SECOND)', {
            second: await this.settingService.getSetting("report.interval")
        });
        queryBuilder.select(['entityType', 'entityID', 'COUNT(entityID) as reportCount']);
        queryBuilder.groupBy('entityID');
        queryBuilder.having('reportCount > :threshold', { threshold: await this.settingService.getSetting("report.threshold") });
        queryBuilder.orderBy("reportCount", "DESC");
        return (await queryBuilder.getRawMany()).map(val => {return {
            entityType: val.entityType,
            entityID: val.entityID,
            reportCount: parseInt(val.reportCount)
        }}) as (Pick<Report, 'entityType' | 'entityID'> & { reportCount: number })[];
    }
}
