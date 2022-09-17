import { Test, TestingModule } from '@nestjs/testing';
import { ApiException } from 'src/exceptions/api.exception';
import { Error } from 'src/exceptions/enums/error.enum';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { LikeableEntity } from '../entities/likeable-entity.entity';
import { LikeableEntityService } from './likeable-entity.service';

describe('LikeableEntityService', () => {
    let service: LikeableEntityService;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "LikeableEntityRepository": MockedObject,
        "LikeItemRepository": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "LikeableEntityRepository": {},
            "LikeItemRepository": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [LikeableEntityService],
        })
        .useMocker(createMocker(dependencies))
        .compile();

        service = module.get<LikeableEntityService>(LikeableEntityService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    test('getLikeableEntityInfoByID()', async () => {
        dependencies["LikeableEntityRepository"].findOne = jest.fn().mockResolvedValueOnce({
            isDisplay: true,
            allowDuplicateLike: true
        });
        dependencies["LikeItemRepository"].count = jest.fn().mockResolvedValueOnce(10);
        service.isEntityLiked = jest.fn().mockResolvedValueOnce(false);
        const data1 = await service.getLikeableEntityInfoByID(1111, 2222);
        expect(dependencies["LikeableEntityRepository"].findOne).toBeCalledWith({
            where: {
                id: 2222,
            },
            select: ['isDisplay', 'allowDuplicateLike'],
        });
        expect(dependencies["LikeItemRepository"].count).toBeCalledWith({ entity: { id: 2222 } });
        expect(service.isEntityLiked).toBeCalledWith(1111, 2222);
        expect(data1).toEqual({
            isDisplay: true,
            allowDuplicateLike: true,
            count: 10,
            isLiked: false
        });
    });

    test('isEntityExists() - Exists', async () => {
        dependencies["LikeableEntityRepository"].count = jest.fn().mockResolvedValueOnce(1);
        const data1 = await service.isEntityExists(1111);
        expect(dependencies["LikeableEntityRepository"].count).toBeCalledWith({ id: 1111 });
        expect(data1).toEqual(true);
    });

    test('isEntityExists() - Not Exists', async () => {
        dependencies["LikeableEntityRepository"].count = jest.fn().mockResolvedValueOnce(0);
        const data1 = await service.isEntityExists(1111);
        expect(dependencies["LikeableEntityRepository"].count).toBeCalledWith({ id: 1111 });
        expect(data1).toEqual(false);
    });

    test('isEntityLiked() - Liked', async () => {
        dependencies["LikeItemRepository"].count = jest.fn().mockResolvedValueOnce(1);
        const data1 = await service.isEntityLiked(1111, 2222);
        expect(dependencies["LikeItemRepository"].count).toBeCalledWith({ entity: { id: 2222 }, user: { id: 1111 } });
        expect(data1).toEqual(true);
    });

    test('isEntityLiked() - Not Liked', async () => {
        dependencies["LikeItemRepository"].count = jest.fn().mockResolvedValueOnce(0);
        const data1 = await service.isEntityLiked(1111, 2222);
        expect(dependencies["LikeItemRepository"].count).toBeCalledWith({ entity: { id: 2222 }, user: { id: 1111 } });
        expect(data1).toEqual(false);
    });

    test('createEntity()', async () => {
        const manager = {
            save: jest.fn().mockResolvedValueOnce({id: 1111})
        };
        const data1 = await service.createEntity(false, manager as any);
        const entity = new LikeableEntity();
        entity.isDisplay = true;
        entity.allowDuplicateLike = false;
        expect(manager.save).toBeCalledWith(entity);
        expect(data1).toEqual(1111);
    });

    test('updateEntityInfo()', async () => {
        dependencies["LikeableEntityRepository"].update = jest.fn();
        await service.updateEntityInfo(1, true, false);
        expect(dependencies["LikeableEntityRepository"].update).toBeCalledWith(
            1,
            {
                isDisplay: true,
                allowDuplicateLike: false
            }
        );
    });

    test('cancelLike()', async () => {
        dependencies["LikeItemRepository"].softDelete = jest.fn();
        service.isEntityLiked = jest.fn().mockResolvedValueOnce(true);
        await service.cancelLike(1111, 2222);
        expect(dependencies["LikeItemRepository"].softDelete).toBeCalledWith({ entity: { id: 2222 }, user: { id: 1111 } });
    });

    test('like() - Allow Duplicate Like', async () => {
        dependencies["LikeableEntityRepository"].findOne = jest.fn().mockResolvedValueOnce({ allowDuplicateLike: true });
        dependencies["LikeItemRepository"].insert = jest.fn();
        await service.like(1111, 2222);
        expect(dependencies["LikeableEntityRepository"].findOne).toBeCalledWith({ id: 2222 });
        expect(dependencies["LikeItemRepository"].insert).toBeCalledWith({ entity: { id: 2222 }, user: { id: 1111 } });
    });

    test('like() - Disallow Duplicate Like', async () => {
        dependencies["LikeableEntityRepository"].findOne = jest.fn().mockResolvedValueOnce({ allowDuplicateLike: false });
        service.isEntityLiked = jest.fn().mockResolvedValueOnce(true);
        try {
            await service.like(1111, 2222);
        } catch (e) {
            expect(e).toEqual(new ApiException(Error.DISALLOW_DUPLICATE_LIKE));
        }
        expect(dependencies["LikeableEntityRepository"].findOne).toBeCalledWith({ id: 2222 });
        expect(service.isEntityLiked).toBeCalledWith(1111, 2222);
    });
});
