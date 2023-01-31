import { Test, TestingModule } from '@nestjs/testing';
import { ApiException } from 'src/exceptions/api.exception';
import { Error } from 'src/exceptions/enums/error.enum';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { CatTag } from '../../entities/cat-tag.entity';
import { TagService } from './tag.service';

describe('TagService', () => {
    let service: TagService;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "CatTagRepository": MockedObject,
        "EntityManager": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "CatTagRepository": {},
            "EntityManager": {},
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [TagService],
        })
        .useMocker(createMocker(dependencies))
        .compile();

        service = module.get<TagService>(TagService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    test('isTagExists() - Exist', async () => {
        dependencies["CatTagRepository"].count = jest.fn();
        dependencies["CatTagRepository"].count.mockResolvedValueOnce(1);
        const data1 = await service.isTagExists(2222);
        expect(dependencies["CatTagRepository"].count).toBeCalledWith({
            where: {
                id: 2222,
            }
        });
        expect(data1).toBe(true);
    });

    test('isTagExists() - Not Exist', async () => {
        dependencies["CatTagRepository"].count = jest.fn();
        dependencies["CatTagRepository"].count.mockResolvedValueOnce(0);
        const data1 = await service.isTagExists(3333);
        expect(dependencies["CatTagRepository"].count).toBeCalledWith({
            where: {
                id: 3333,
            }
        });
        expect(data1).toBe(false);
    });

    test('getTagsByCatID()', async () => {
        dependencies["CatTagRepository"].find = jest.fn();
        dependencies["CatTagRepository"].find.mockResolvedValueOnce([{ id: 1 }]);
        const data = await service.getTagsByCatID(4444);
        expect(dependencies["CatTagRepository"].find).toBeCalledWith({
            where: {
                cat: {
                    id: 4444
                }
            },
            select: ['id', 'name', 'createdDate']
        });
        expect(data).toEqual([{ id: 1 }]);
    });

    test('deleteTag()', async () => {
        dependencies["CatTagRepository"].softDelete = jest.fn();
        await service.deleteTag(2222);
        expect(dependencies["CatTagRepository"].softDelete).toBeCalledWith(2222);
    });

    test('addTag() - Not Duplicate Tag', async () => {
        dependencies["CatTagRepository"].count = jest.fn().mockResolvedValueOnce(0);
        dependencies["CatTagRepository"].insert = jest.fn().mockResolvedValueOnce({ identifiers: [ { id: 1111 } ] });
        const data = await service.addTag(2222, "测试");
        expect(dependencies["CatTagRepository"].count).toBeCalledWith({ cat: { id: 2222 }, name: "测试" });
        expect(dependencies["CatTagRepository"].insert).toBeCalledWith({ cat: { id: 2222 }, name: "测试" });
        expect(data).toEqual(1111);
    });

    test('addTag() - Duplicate Tag', async () => {
        dependencies["CatTagRepository"].count = jest.fn().mockResolvedValueOnce(1);
        try {
            await service.addTag(2222, "测试");
        } catch (e) {
            expect(e).toEqual(new ApiException(Error.DISALLOW_DUPLICATE_TAG));
        }
        expect(dependencies["CatTagRepository"].count).toBeCalledWith({ cat: { id: 2222 }, name: "测试" });
    });

    test('deleteTagsByCatID() - With Transaction', async () => {
        const manager = {
            softDelete: jest.fn()
        };
        await service.deleteTagsByCatID(1, manager as any);
        expect(manager.softDelete).toBeCalledWith(CatTag, { cat: { id: 1 } });
    });

    test('deleteTagsByCatID() - Without Transaction', async () => {
        const manager = {
            softDelete: jest.fn()
        };
        dependencies["EntityManager"].transaction = jest.fn().mockImplementation(func => func(manager));
        await service.deleteTagsByCatID(1);
        expect(manager.softDelete).toBeCalledWith(CatTag, { cat: { id: 1 } });
    });
});
