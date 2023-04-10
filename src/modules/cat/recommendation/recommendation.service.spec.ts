import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { IsNull } from 'typeorm';
import { RecommendationService } from './recommendation.service';

describe('RecommendationService', () => {
    let service: RecommendationService;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "CatRecommendationRepository": MockedObject,
        "CatService": MockedObject,
        "SettingService": MockedObject,
        "CatRepository": MockedObject,
        "EntityManager": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "CatRecommendationRepository": {},
            "CatService": {},
            "SettingService": {},
            "CatRepository": {},
            "EntityManager": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [RecommendationService],
        })
        .useMocker(createMocker(dependencies))
        .compile();

        service = module.get<RecommendationService>(RecommendationService);
    });

    test('should be defined', () => {
        expect(service).toBeDefined();
    });

    test('updateRecommandationCatsList() - "recommandations.default.algorithm" is "random"', async () => {
        jest.useFakeTimers();
        dependencies["SettingService"].getSetting = jest.fn().mockResolvedValueOnce('random').mockResolvedValueOnce(3600);
        (service as any).updateDefaultRecommandationCatsListUsingRandom = jest.fn();
        jest.spyOn(global, 'setTimeout');
        jest.spyOn(global, 'clearTimeout');
        await service.updateRecommandationCatsList();
        expect(dependencies["SettingService"].getSetting.mock.calls).toEqual([
            ['recommandations.default.algorithm'],
            ['recommandations.default.interval']
        ]);
        expect((service as any).updateDefaultRecommandationCatsListUsingRandom).toBeCalled();
        expect(clearTimeout).toBeCalled();
        expect(setTimeout).toBeCalledWith(expect.any(Function), 3600 * 1000);
    });

    test('onApplicationBootstrap() - "recommandations.default.algorithm" and "recommandations.default.interval" Exists', async () => {
        const subscibeFunction = jest.fn();
        dependencies["SettingService"].getSetting = jest.fn().mockResolvedValueOnce('random').mockResolvedValueOnce(3600);
        dependencies["CatService"].subscibreCatsInfoUpdatedEvent = jest.fn().mockReturnValueOnce({subscribe: subscibeFunction});
        service.updateRecommandationCatsList = jest.fn();
        await service.onApplicationBootstrap();
        expect(dependencies["SettingService"].getSetting).toBeCalledWith('recommandations.default.algorithm');
        expect(dependencies["CatService"].subscibreCatsInfoUpdatedEvent).toBeCalled();
        expect(subscibeFunction).toBeCalledWith(expect.any(Function));
    });

    test('onApplicationBootstrap() - "recommandations.default.algorithm" and "recommandations.default.interval" Not Exists', async () => {
        const subscibeFunction = jest.fn();
        dependencies["SettingService"].getSetting = jest.fn().mockResolvedValue("");
        dependencies["SettingService"].createSetting = jest.fn();
        dependencies["CatService"].subscibreCatsInfoUpdatedEvent = jest.fn().mockReturnValueOnce({subscribe: subscibeFunction});
        service.updateRecommandationCatsList = jest.fn();
        await service.onApplicationBootstrap();
        expect(dependencies["SettingService"].getSetting.mock.calls).toEqual([
            ['recommandations.default.algorithm'],
            ['recommandations.default.interval']
        ]);
        expect(dependencies["SettingService"].createSetting.mock.calls).toEqual([
            ["recommandations.default.algorithm", 'random', false],
            ["recommandations.default.interval", 3600, false]
        ]);
        expect(dependencies["CatService"].subscibreCatsInfoUpdatedEvent).toBeCalled();
        expect(subscibeFunction).toBeCalledWith(expect.any(Function));
    });

    test('getRecommandationCatsListByUserID() - User Not Null', async () => {
        const createQueryBuilder = {
            andWhere: jest.fn(),
            select: jest.fn(),
            addOrderBy: jest.fn(),
            take: jest.fn(),
            skip: jest.fn(),
            getRawMany: jest.fn().mockResolvedValueOnce([{catID: 111}, {catID: 333}])
        };
        dependencies["CatRecommendationRepository"].createQueryBuilder = jest.fn().mockImplementationOnce(() => createQueryBuilder);
        const data1 = await service.getRecommandationCatsListByUserID(2222, 10, 0);
        expect(dependencies["CatRecommendationRepository"].createQueryBuilder).toBeCalledWith('list');
        expect(createQueryBuilder.andWhere).toBeCalledWith({ user: { id: 2222 } });
        expect(createQueryBuilder.addOrderBy).toBeCalledWith('id');
        expect(createQueryBuilder.take).toBeCalledWith(10);
        expect(createQueryBuilder.skip).toBeCalledWith(0);
        expect(createQueryBuilder.select).toBeCalledWith(['catId as catID']);
        expect(createQueryBuilder.getRawMany).toBeCalledWith();
        expect(data1).toEqual([111, 333]);
    });

    test('getRecommandationCatsListByUserID() - User Null', async () => {
        const createQueryBuilder = {
            andWhere: jest.fn(),
            select: jest.fn(),
            addOrderBy: jest.fn(),
            take: jest.fn(),
            skip: jest.fn(),
            getRawMany: jest.fn().mockResolvedValueOnce([{catID: 111}, {catID: 333}])
        };
        dependencies["CatRecommendationRepository"].createQueryBuilder = jest.fn().mockImplementationOnce(() => createQueryBuilder);
        const data1 = await service.getRecommandationCatsListByUserID(null, 10, 0);
        expect(dependencies["CatRecommendationRepository"].createQueryBuilder).toBeCalledWith('list');
        expect(createQueryBuilder.andWhere).toBeCalledWith({ user: { id: IsNull() } });
        expect(createQueryBuilder.addOrderBy).toBeCalledWith('id');
        expect(createQueryBuilder.take).toBeCalledWith(10);
        expect(createQueryBuilder.skip).toBeCalledWith(0);
        expect(createQueryBuilder.select).toBeCalledWith(['catId as catID']);
        expect(createQueryBuilder.getRawMany).toBeCalledWith();
        expect(data1).toEqual([111, 333]);
    });

    test('getUserRecommandationCatsList() - User', async () => {
        service.getRecommandationCatsListByUserID = jest.fn().mockResolvedValueOnce([1, 2, 3]);
        dependencies["CatService"].getCatsListByIDs = jest.fn().mockResolvedValueOnce([{"a": "b"}]);
        const data1 = await service.getUserRecommandationCatsList(2222, 10, 20);
        expect(service.getRecommandationCatsListByUserID).toBeCalledWith(2222, 10, 20);
        expect(dependencies["CatService"].getCatsListByIDs).toBeCalledWith([1, 2, 3], 10, 0);
        expect(data1).toEqual([{"a": "b"}]);
    });

    test('getUserRecommandationCatsList() - Default', async () => {
        service.getRecommandationCatsListByUserID = jest.fn().mockResolvedValueOnce([]).mockResolvedValueOnce([1, 2, 3]);
        dependencies["CatService"].getCatsListByIDs = jest.fn().mockResolvedValueOnce([{"a": "b"}]);
        const data1 = await service.getUserRecommandationCatsList(2222, 10, 20);
        expect(service.getRecommandationCatsListByUserID).toBeCalledWith(null, 10, 20);
        expect(dependencies["CatService"].getCatsListByIDs).toBeCalledWith([1, 2, 3], 10, 0);
        expect(data1).toEqual([{"a": "b"}]);
    });

    test('getUserRecommandationCatsList() - Undefined', async () => {
        service.getRecommandationCatsListByUserID = jest.fn().mockResolvedValue([]);
        dependencies["CatService"].getCatsListByIDs = jest.fn();
        try {
            await service.getUserRecommandationCatsList(2222, 10, 20);
        } catch(e) {
            expect(e).toBeInstanceOf(NotFoundException);
        }
        expect((service.getRecommandationCatsListByUserID as any).mock.calls).toEqual([
            [2222, 10, 20],
            [null, 10, 20]
        ]);
        expect(dependencies["CatService"].getCatsListByIDs).toBeCalledTimes(0);
    });
});
