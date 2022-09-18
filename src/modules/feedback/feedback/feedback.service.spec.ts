import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { FeedbackProgress } from '../enums/feedback-progress.enum';
import { FeedbackType } from '../enums/feedback-type.enum';
import { FeedbackService } from './feedback.service';

describe('FeedbackService', () => {
    let service: FeedbackService;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: {
        "FeedbackRepository": MockedObject,
        "FeedbackPhotoRepository": MockedObject,
        "FileService": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "FeedbackRepository": {},
            "FeedbackPhotoRepository": {},
            "FileService": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [FeedbackService],
        })
            .useMocker(createMocker(dependencies))
            .compile();

        service = module.get<FeedbackService>(FeedbackService);
    });

    test('should be defined', () => {
        expect(service).toBeDefined();
    });

    test("createFeedback() - CatID is number", async () => {
        dependencies["FeedbackRepository"].insert = jest.fn().mockResolvedValueOnce({ identifiers: [ {id: 8123} ] });
        dependencies["FeedbackPhotoRepository"].insert = jest.fn();
        dependencies["FileService"].getFileNameByToken = jest.fn().mockReturnValueOnce("heeeello.jpg");
        const data = await service.createFeedback(FeedbackType.CAT, 888, 999, "abcd", ["token1"]);
        expect(dependencies["FeedbackRepository"].insert).toBeCalledWith({
            type: FeedbackType.CAT,
            cat: {
                id: 888
            },
            user: {
                id: 999
            },
            progress: FeedbackProgress.PENDING,
            content: "abcd"
        });
        expect(dependencies["FileService"].getFileNameByToken).toBeCalledWith("token1");
        expect(dependencies["FeedbackPhotoRepository"].insert).toBeCalledWith({
            feedback: {
                id: 8123
            },
            fileName: "heeeello.jpg"
        });
        expect(data).toEqual(8123);
    });

    test("createFeedback() - CatID is undefined", async () => {
        dependencies["FeedbackRepository"].insert = jest.fn().mockResolvedValueOnce({ identifiers: [ {id: 8123} ] });
        dependencies["FeedbackPhotoRepository"].insert = jest.fn();
        dependencies["FileService"].getFileNameByToken = jest.fn().mockReturnValueOnce("heeeello.jpg");
        const data = await service.createFeedback(FeedbackType.CAT, null, 999, "abcd", ["token1"]);
        expect(dependencies["FeedbackRepository"].insert).toBeCalledWith({
            type: FeedbackType.CAT,
            cat: {
                id: null
            },
            user: {
                id: 999
            },
            progress: FeedbackProgress.PENDING,
            content: "abcd"
        });
        expect(data).toEqual(8123);
        expect(dependencies["FileService"].getFileNameByToken).toBeCalledWith("token1");
        expect(dependencies["FeedbackPhotoRepository"].insert).toBeCalledWith({
            feedback: {
                id: 8123
            },
            fileName: "heeeello.jpg"
        });
    });

    test('updateFeedbackInfo()', async () => {
        dependencies["FeedbackRepository"].update = jest.fn();
        await service.updateFeedbackInfo(1, FeedbackType.CAT, FeedbackProgress.FINISHED);
        expect(dependencies["FeedbackRepository"].update).toBeCalledWith(
            1,
            {
                type: FeedbackType.CAT,
                progress: FeedbackProgress.FINISHED
            }
        );
    });

    test('deleteFeedback()', async () => {
        dependencies["FeedbackRepository"].softDelete = jest.fn();
        await service.deleteFeedback(1);
        expect(dependencies["FeedbackRepository"].softDelete).toBeCalledWith(1);
    });

    test('getPhotosByFeedbackID()', async () => {
        dependencies["FeedbackPhotoRepository"].find = jest.fn().mockResolvedValueOnce([{ id: 1, fileName: "123.jpg" }]);
        await service.getPhotosByFeedbackID(1, 10, 0);
        expect(dependencies["FeedbackPhotoRepository"].find).toBeCalledWith({
            where: {
                feedback: {
                    id: 1
                }
            },
            select: ['id', 'fileName'],
            take: 10,
            skip: 0
        });
    });

    test('isFeedbackExists() - Exist', async () => {
        dependencies["FeedbackRepository"].count = jest.fn();
        dependencies["FeedbackRepository"].count.mockResolvedValueOnce(1);
        const data1 = await service.isFeedbackExists(2222);
        expect(dependencies["FeedbackRepository"].count).toBeCalledWith({ id: 2222 });
        expect(data1).toBe(true);
    });

    test('isFeedbackExists() - Not Exist', async () => {
        dependencies["FeedbackRepository"].count = jest.fn();
        dependencies["FeedbackRepository"].count.mockResolvedValueOnce(0);
        const data1 = await service.isFeedbackExists(3333);
        expect(dependencies["FeedbackRepository"].count).toBeCalledWith({ id: 3333 });
        expect(data1).toBe(false);
    });

    test('searchFeedbacks() - Without UserID and progress and type', async () => {
        service.getPhotosByFeedbackID = jest.fn().mockResolvedValue([{ id: 222, fileName: "123.jpg" }]);
        const createQueryBuilder = {
            select: jest.fn(),
            take: jest.fn(),
            skip: jest.fn(),
            orderBy: jest.fn(),
            getRawMany: jest.fn().mockReturnValue([{id: 111, progress: FeedbackProgress.PENDING}])
        };
        dependencies["FeedbackRepository"].createQueryBuilder = jest.fn().mockImplementationOnce(() => createQueryBuilder);
        const data1 = await service.searchFeedbacks(undefined, undefined, undefined, 10, 0, 5);
        expect(dependencies["FeedbackRepository"].createQueryBuilder).toBeCalledWith('order');
        expect(createQueryBuilder.select).toBeCalledWith(['id', 'type', 'progress', 'content', 'createdDate', 'userId as userID', 'catId as catID']);
        expect(createQueryBuilder.getRawMany).toBeCalledWith();
        expect(createQueryBuilder.take).toBeCalledWith(10);
        expect(createQueryBuilder.skip).toBeCalledWith(0);
        expect(createQueryBuilder.orderBy).toBeCalledWith('createdDate', 'DESC');
        expect(service.getPhotosByFeedbackID).toBeCalledWith(111, 5, 0);
        expect(data1).toEqual([{id: 111, progress: FeedbackProgress.PENDING, photos: [{id: 222, fileName: "123.jpg"}]}]);
    });

    test('searchFeedbacks() - With UserID and progress and type', async () => {
        service.getPhotosByFeedbackID = jest.fn().mockResolvedValue([{ id: 222, fileName: "123.jpg" }]);
        const createQueryBuilder = {
            andWhere: jest.fn(),
            select: jest.fn(),
            take: jest.fn(),
            skip: jest.fn(),
            orderBy: jest.fn(),
            getRawMany: jest.fn().mockReturnValue([{id: 111, progress: FeedbackProgress.PENDING}])
        };
        dependencies["FeedbackRepository"].createQueryBuilder = jest.fn().mockImplementationOnce(() => createQueryBuilder);
        const data1 = await service.searchFeedbacks(1, FeedbackProgress.PENDING, FeedbackType.CAT, 10, 0, 5);
        expect(dependencies["FeedbackRepository"].createQueryBuilder).toBeCalledWith('order');
        expect(createQueryBuilder.select).toBeCalledWith(['id', 'type', 'progress', 'content', 'createdDate', 'userId as userID', 'catId as catID']);
        expect(createQueryBuilder.getRawMany).toBeCalledWith();
        expect(createQueryBuilder.andWhere.mock.calls).toEqual([
            [{type: FeedbackType.CAT }],
            [{progress: FeedbackProgress.PENDING }],
            [{ user: { id: 1 } }],
        ]);
        expect(createQueryBuilder.take).toBeCalledWith(10);
        expect(createQueryBuilder.skip).toBeCalledWith(0);
        expect(createQueryBuilder.orderBy).toBeCalledWith('createdDate', 'DESC');
        expect(service.getPhotosByFeedbackID).toBeCalledWith(111, 5, 0);
        expect(data1).toEqual([{id: 111, progress: FeedbackProgress.PENDING, photos: [{id: 222, fileName: "123.jpg"}]}]);
    });
});
