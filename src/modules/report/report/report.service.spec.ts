import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { ReportEntityType } from '../enums/report-entity-type.enum';
import { ReportType } from '../enums/report-type.enum';
import { ReportService } from './report.service';

describe('ReportService', () => {
    let service: ReportService;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "ReportRepository": MockedObject,
        "SettingService": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "ReportRepository": {},
            "SettingService": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [ReportService],
        })
        .useMocker(createMocker(dependencies))
        .compile();

        service = module.get<ReportService>(ReportService);
    });

    test('should be defined', () => {
        expect(service).toBeDefined();
    });

    test('onApplicationBootstrap() - "report.interval" and "report.threshold" Exists', async () => {
        dependencies["SettingService"].getSetting = jest.fn().mockImplementation(name => name === 'report.interval' ? 30 * 24 * 60 * 60 : 10);
        await service.onApplicationBootstrap();
        expect(dependencies["SettingService"].getSetting.mock.calls).toEqual([
            ['report.interval'],
            ['report.threshold']
        ]);
    });

    test('onApplicationBootstrap() - "report.interval" and "report.threshold" Not Exists', async () => {
        dependencies["SettingService"].getSetting = jest.fn().mockResolvedValue("");
        dependencies["SettingService"].createSetting = jest.fn();
        await service.onApplicationBootstrap();
        expect(dependencies["SettingService"].getSetting.mock.calls).toEqual([
            ['report.interval'],
            ['report.threshold']
        ]);
        expect(dependencies["SettingService"].createSetting.mock.calls).toEqual([
            ['report.interval', 30 * 24 * 60 * 60, false],
            ['report.threshold', 10, false]
        ]);
    });

    test('createReport()', async () => {
        dependencies["ReportRepository"].insert = jest.fn().mockResolvedValueOnce({
            identifiers: [ {id: 1} ]
        });
        const data1 = await service.createReport(1111, ReportEntityType.CAT_PHOTOS, 10, ReportType.ADVERTISEMENT, '测试');
        expect(dependencies["ReportRepository"].insert).toBeCalledWith({
            user: { id: 1111 },
            entityType: ReportEntityType.CAT_PHOTOS,
            entityID: 10,
            type: ReportType.ADVERTISEMENT,
            content: '测试'
        });
        expect(data1).toEqual(1);
    });
    
    test('getReportsByUserID()', async () => {
        const createQueryBuilder = {
            where: jest.fn(),
            select: jest.fn(),
            orderBy: jest.fn(),
            take: jest.fn(),
            skip: jest.fn(),
            getRawMany: jest.fn().mockResolvedValueOnce([{id: 111}, {id: 333}])
        };
        dependencies["ReportRepository"].createQueryBuilder = jest.fn().mockImplementationOnce(() => createQueryBuilder);
        const data1 = await service.getReportsByUserID(2222, 10, 0);
        expect(dependencies["ReportRepository"].createQueryBuilder).toBeCalledWith('report');
        expect(createQueryBuilder.take).toBeCalledWith(10);
        expect(createQueryBuilder.skip).toBeCalledWith(0);
        expect(createQueryBuilder.where).toBeCalledWith({ user: { id: 2222 } });
        expect(createQueryBuilder.orderBy).toBeCalledWith("createdDate", "DESC");
        expect(createQueryBuilder.select).toBeCalledWith(['id', 'entityType', 'entityID', 'type', 'content', 'createdDate']);
        expect(createQueryBuilder.getRawMany).toBeCalledWith();
        expect(data1).toEqual([{id: 111}, {id: 333}]);
    });

    test('getReportsByEntity()', async () => {
        const createQueryBuilder = {
            where: jest.fn(),
            select: jest.fn(),
            orderBy: jest.fn(),
            take: jest.fn(),
            skip: jest.fn(),
            getRawMany: jest.fn().mockResolvedValueOnce([{id: 111}, {id: 333}])
        };
        dependencies["ReportRepository"].createQueryBuilder = jest.fn().mockImplementationOnce(() => createQueryBuilder);
        const data1 = await service.getReportsByEntity(ReportEntityType.CAT_PHOTOS, 1, 10, 0);
        expect(dependencies["ReportRepository"].createQueryBuilder).toBeCalledWith('report');
        expect(createQueryBuilder.take).toBeCalledWith(10);
        expect(createQueryBuilder.skip).toBeCalledWith(0);
        expect(createQueryBuilder.where).toBeCalledWith({ entityType: ReportEntityType.CAT_PHOTOS, entityID: 1 });
        expect(createQueryBuilder.orderBy).toBeCalledWith("createdDate", "DESC");
        expect(createQueryBuilder.select).toBeCalledWith(['id', 'type', 'content', 'createdDate', 'userId as userID']);
        expect(createQueryBuilder.getRawMany).toBeCalledWith();
        expect(data1).toEqual([{id: 111}, {id: 333}]);
    });

    test('getEntitiesExceedReportThreshold()', async () => {
        const createQueryBuilder = {
            andWhere: jest.fn(),
            select: jest.fn(),
            orderBy: jest.fn(),
            take: jest.fn(),
            skip: jest.fn(),
            groupBy: jest.fn(),
            having: jest.fn(),
            getRawMany: jest.fn().mockResolvedValueOnce([{entityID: 111, reportCount: "123"}, {entityID: 333, reportCount: "2222"}])
        };
        dependencies["ReportRepository"].createQueryBuilder = jest.fn().mockImplementationOnce(() => createQueryBuilder);
        dependencies["SettingService"].getSetting = jest.fn().mockImplementation(name => name === 'report.threshold' ? 10 : 30 * 24 * 60 * 60);
        const data1 = await service.getEntitiesExceedReportThreshold(ReportEntityType.CAT_PHOTOS, 10, 0);
        expect(dependencies["ReportRepository"].createQueryBuilder).toBeCalledWith('report');
        expect(createQueryBuilder.take).toBeCalledWith(10);
        expect(createQueryBuilder.skip).toBeCalledWith(0);
        expect(createQueryBuilder.andWhere.mock.calls).toEqual([
            [{ entityType: ReportEntityType.CAT_PHOTOS }],
            ['createdDate  > DATE_SUB(NOW(), INTERVAL :second SECOND)', { second: 30 * 24 * 60 * 60}]
        ]);
        expect(createQueryBuilder.orderBy).toBeCalledWith("reportCount", "DESC");
        expect(createQueryBuilder.select).toBeCalledWith(['entityType', 'entityID', 'COUNT(entityID) as reportCount']);
        expect(createQueryBuilder.groupBy).toBeCalledWith('entityID');
        expect(createQueryBuilder.having).toBeCalledWith('reportCount > :threshold', { threshold: 10 });
        expect(createQueryBuilder.getRawMany).toBeCalledWith();
        expect(dependencies["SettingService"].getSetting.mock.calls).toEqual([
            ['report.interval'],
            ['report.threshold']
        ]);
        expect(data1).toEqual([{entityID: 111, reportCount: 123}, {entityID: 333, reportCount: 2222}]);
    });
});
