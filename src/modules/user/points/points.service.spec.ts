import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiException } from 'src/exceptions/api.exception';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { PointsTransaction } from '../entities/points-transaction.entity';
import { User } from '../entities/user.entity';
import { PointsTransactionReason } from '../enums/points-transaction-reason.enum';
import { PointsService } from './points.service';

describe('AchievementService', () => {
    let service: PointsService;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "PointsTransactionRepository": MockedObject,
        "UserRepository": MockedObject,
        "EntityManager": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "PointsTransactionRepository": {},
            "UserRepository": {},
            "EntityManager": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [PointsService],
        })
        .useMocker(createMocker(dependencies))
        .compile();

        service = module.get<PointsService>(PointsService);
    });


    test('should be defined', () => {
        expect(service).toBeDefined();
    });

    test('getPointsTransaction()', async () => {
        dependencies["PointsTransactionRepository"].find = jest.fn().mockResolvedValueOnce({"aaa": "bbb"});
        const data1 = await service.getPointsTransaction(2222, 10, 20);
        expect(dependencies["PointsTransactionRepository"].find).toBeCalledWith({
            where: {
                user: {
                    id: 2222,
                },
            },
            select: ['createdDate', 'description', 'points', 'reason', 'id'],
            take: 10,
            skip: 20,
        });
        expect(data1).toEqual({"aaa": "bbb"});
    });

    test('getPointsRankingInDescending()', async () => {
        dependencies["UserRepository"].find = jest.fn().mockResolvedValueOnce({"aaa": "bbb"});
        const data1 = await service.getPointsRankingInDescending(10, 20);
        expect(dependencies["UserRepository"].find).toBeCalledWith({
            select: ['avatarFileName', 'id', 'nickName', 'points'],
            order: {
                points: 'DESC',
            },
            take: 10,
            skip: 20,
        });
        expect(data1).toEqual({"aaa": "bbb"});
    });

    test('changePoints() - User exists with Transaction', async () => {
        const pointsTransactionRepository = {
            save: jest.fn()
        };
        const userRepository = {
            findOne: jest.fn().mockResolvedValueOnce({"points": 20})
        };
        const manager = {
            getRepository: jest.fn().mockImplementation(val => val == PointsTransaction ? pointsTransactionRepository : userRepository),
            update: jest.fn()
        };
        await service.changePoints(2222, -10, PointsTransactionReason.ADMIN, "bgfdg", manager as any);
        expect(userRepository.findOne).toBeCalledWith({
            where: { id: 2222 },
            select: ['points'],
        });
        expect(manager.update).toBeCalledWith(User, 2222, { points: 10 });
        expect(pointsTransactionRepository.save).toBeCalledWith({
            user: {
                id: 2222,
            },
            reason: PointsTransactionReason.ADMIN,
            points: -10,
            description: "bgfdg",
        });
    });

    test('changePoints() - User not exists with Transaction', async () => {
        const pointsTransactionRepository = {
            save: jest.fn()
        };
        const userRepository = {
            findOne: jest.fn().mockResolvedValueOnce(undefined)
        };
        const manager = {
            getRepository: jest.fn().mockImplementation(val => val == PointsTransaction ? pointsTransactionRepository : userRepository),
            update: jest.fn()
        };
        try {
            await service.changePoints(2222, -10, PointsTransactionReason.ADMIN, "bgfdg", manager as any);
        } catch(e) {
            expect(e).toBeInstanceOf(NotFoundException);
        }
        expect(userRepository.findOne).toBeCalledWith({
            where: { id: 2222 },
            select: ['points'],
        });
        expect(manager.update).toBeCalledTimes(0);
        expect(pointsTransactionRepository.save).toBeCalledTimes(0);
    });

    test('changePoints() - User exists but points not enough with Transaction', async () => {
        const pointsTransactionRepository = {
            save: jest.fn()
        };
        const userRepository = {
            findOne: jest.fn().mockResolvedValueOnce({"points": 20})
        };
        const manager = {
            getRepository: jest.fn().mockImplementation(val => val == PointsTransaction ? pointsTransactionRepository : userRepository),
            update: jest.fn()
        };
        try {
            await service.changePoints(2222, -100, PointsTransactionReason.ADMIN, "bgfdg", manager as any);
        } catch(e) {
            expect(e).toBeInstanceOf(ApiException);
        }
        expect(userRepository.findOne).toBeCalledWith({
            where: { id: 2222 },
            select: ['points'],
        });
        expect(manager.update).toBeCalledTimes(0);
        expect(pointsTransactionRepository.save).toBeCalledTimes(0);
    });

    test('changePoints() - User exists withnot Transaction', async () => {
        const pointsTransactionRepository = {
            save: jest.fn()
        };
        const userRepository = {
            findOne: jest.fn().mockResolvedValueOnce({"points": 20})
        };
        const manager = {
            getRepository: jest.fn().mockImplementation(val => val == PointsTransaction ? pointsTransactionRepository : userRepository),
            update: jest.fn()
        };
        dependencies["EntityManager"].transaction = jest.fn().mockImplementation(func => func(manager));
        await service.changePoints(2222, -10, PointsTransactionReason.ADMIN, "bgfdg");
        expect(dependencies["EntityManager"].transaction).toBeCalledTimes(1);
        expect(userRepository.findOne).toBeCalledWith({
            where: { id: 2222 },
            select: ['points'],
        });
        expect(manager.update).toBeCalledWith(User, 2222, { points: 10 });
        expect(pointsTransactionRepository.save).toBeCalledWith({
            user: {
                id: 2222,
            },
            reason: PointsTransactionReason.ADMIN,
            points: -10,
            description: "bgfdg",
        });
    });
});
