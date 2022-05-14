import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { AchievementService } from './achievement.service';

describe('AchievementService', () => {
    let service: AchievementService;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "AchievementRepository": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "AchievementRepository": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [AchievementService],
        })
        .useMocker(createMocker(dependencies))
        .compile();

        service = module.get<AchievementService>(AchievementService);
    });

    test('should be defined', () => {
        expect(service).toBeDefined();
    });

    test('getUserAchievements()', async () => {
        const createQueryBuilder = {
            andWhere: jest.fn(),
            select: jest.fn(),
            leftJoinAndSelect: jest.fn(),
            getRawMany: jest.fn().mockResolvedValueOnce([
                {id: 1, description: "avbd", percent: 20, updatedDate: new Date(1519129853500)},
                {id: 2, description: "gfgg", percent: null, updatedDate: null}
            ])
        };
        dependencies["AchievementRepository"].createQueryBuilder = jest.fn().mockImplementationOnce(() => createQueryBuilder);
        const data1 = await service.getUserAchievements(3333);
        expect(dependencies["AchievementRepository"].createQueryBuilder).toBeCalledWith('achievement');
        expect(createQueryBuilder.leftJoinAndSelect).toBeCalledWith('achievement.userAchievements', 'ua', 'ua.userId = :id', { id: 3333 });
        expect(createQueryBuilder.andWhere).toBeCalledWith({ enable: true });
        expect(createQueryBuilder.select).toBeCalledWith([
            'achievement.id as id',
            'achievement.description as description',
            'ua.percent as percent',
            'ua.updatedDate as updatedDate',
        ]);
        expect(createQueryBuilder.getRawMany).toBeCalledWith();
        expect(data1).toEqual([
            {id: 1, description: "avbd", percent: 20, updatedDate: new Date(1519129853500)},
            {id: 2, description: "gfgg", percent: 0, updatedDate: expect.any(Date)}
        ]);
    });
});
