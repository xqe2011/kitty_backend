import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { RecommendationService } from './recommendation.service';

describe('RecommendationService', () => {
    let service: RecommendationService;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "CatRecommendationRepository": MockedObject,
        "CatService": MockedObject,
        "SettingService": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "CatRecommendationRepository": {},
            "CatService": {},
            "SettingService": {}
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

    test('getRecommandationCatsListByUserID()', async () => {
        const createQueryBuilder = {
            andWhere: jest.fn(),
            select: jest.fn(),
            addOrderBy: jest.fn(),
            getRawMany: jest.fn().mockResolvedValueOnce([{catID: 111}, {catID: 333}])
        };
        dependencies["CatRecommendationRepository"].createQueryBuilder = jest.fn().mockImplementationOnce(() => createQueryBuilder);
        const data1 = await service.getRecommandationCatsListByUserID(2222);
        expect(dependencies["CatRecommendationRepository"].createQueryBuilder).toBeCalledWith('list');
        expect(createQueryBuilder.andWhere).toBeCalledWith({ user: { id: 2222 } });
        expect(createQueryBuilder.addOrderBy).toBeCalledWith('id');
        expect(createQueryBuilder.select).toBeCalledWith(['catId as catID']);
        expect(createQueryBuilder.getRawMany).toBeCalledWith();
        expect(data1).toEqual([111, 333]);
    });

    test('getUserRecommandationCatsList() - User', async () => {
        service.getRecommandationCatsListByUserID = jest.fn().mockResolvedValueOnce([1, 2, 3]);
        dependencies["CatService"].getCatsListByIDs = jest.fn().mockResolvedValueOnce([{"a": "b"}]);
        const data1 = await service.getUserRecommandationCatsList(2222, 10, 20);
        expect(service.getRecommandationCatsListByUserID).toBeCalledWith(2222);
        expect(dependencies["CatService"].getCatsListByIDs).toBeCalledWith([1, 2, 3], 10, 20);
        expect(data1).toEqual([{"a": "b"}]);
    });

    test('getUserRecommandationCatsList() - Default', async () => {
        service.getRecommandationCatsListByUserID = jest.fn().mockResolvedValueOnce(undefined);
        dependencies["CatService"].getCatsListByIDs = jest.fn().mockResolvedValueOnce([{"a": "b"}]);
        dependencies["SettingService"].getSetting = jest.fn().mockResolvedValueOnce([3, 4, 5]);
        const data1 = await service.getUserRecommandationCatsList(2222, 10, 20);
        expect(service.getRecommandationCatsListByUserID).toBeCalledWith(2222);
        expect(dependencies["SettingService"].getSetting).toBeCalledWith("recommandations.default");
        expect(dependencies["CatService"].getCatsListByIDs).toBeCalledWith([3, 4, 5], 10, 20);
        expect(data1).toEqual([{"a": "b"}]);
    });

    test('getUserRecommandationCatsList() - Undefined', async () => {
        service.getRecommandationCatsListByUserID = jest.fn().mockResolvedValueOnce(undefined);
        dependencies["CatService"].getCatsListByIDs = jest.fn();
        dependencies["SettingService"].getSetting = jest.fn().mockResolvedValueOnce('');
        try {
            await service.getUserRecommandationCatsList(2222, 10, 20);
        } catch(e) {
            expect(e).toBeInstanceOf(NotFoundException);
        }
        expect(service.getRecommandationCatsListByUserID).toBeCalledWith(2222);
        expect(dependencies["SettingService"].getSetting).toBeCalledWith("recommandations.default");
        expect(dependencies["CatService"].getCatsListByIDs).toBeCalledTimes(0);
    });
});
