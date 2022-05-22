import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { Like } from 'typeorm';
import { CatPhotoType } from '../enums/cat-photo-type.enum';
import { CatService } from './cat.service';

describe('CatService', () => {
    let service: CatService;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "PhotoService": MockedObject,
        "CatRepository": MockedObject,
        "VectorService": MockedObject,
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "PhotoService": {},
            "CatRepository": {},
            "VectorService": {},
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [CatService],
        })
        .useMocker(createMocker(dependencies))
        .compile();

        service = module.get<CatService>(CatService);
    });

    test('should be defined', () => {
        expect(service).toBeDefined();
    });

    test('searchCatByKeyword()', async () => {
        dependencies["CatRepository"].find = jest.fn().mockResolvedValue([
            {id: 5824},
            {id: 5825},
        ]);
        const data1 = await service.searchCatByKeyword("你好");
        expect(dependencies["CatRepository"].find).toBeCalledWith({
            where: [
                { name: Like('%你好%') },
                { species: Like('%你好%') },
                { description: Like('%你好%') },
                { haunt: Like('%你好%') },
                { isNeuter: undefined },
            ],
            select: ['id'],
        });
        expect(data1).toEqual([5824, 5825]);
    });

    test('getCatsListByIDs() - Empty Array', async () => {
        dependencies["CatRepository"].createQueryBuilder = jest.fn().mockImplementationOnce(() => {{}});
        const data1 = await service.getCatsListByIDs([], 33, 44);
        expect(dependencies["CatRepository"].createQueryBuilder).toBeCalledTimes(0);
        expect(data1).toEqual([]);
    });

    test('getCatsListByIDs() - Null', async () => {
        dependencies["CatRepository"].createQueryBuilder = jest.fn().mockImplementationOnce(() => {{}});
        const data1 = await service.getCatsListByIDs(null, 33, 44);
        expect(dependencies["CatRepository"].createQueryBuilder).toBeCalledTimes(0);
        expect(data1).toEqual([]);
    });

    test('getCatsListByIDs() - No specify ids', async () => {
        const createQueryBuilder = {
            innerJoin: jest.fn(),
            andWhere: jest.fn(),
            select: jest.fn(),
            orderBy: jest.fn(),
            limit: jest.fn(),
            offset: jest.fn(),
            getRawMany: jest.fn().mockReturnValue([{id: 111, name: "你好", description: "desc", coverFileName: "1.jpg"}])
        };
        dependencies["CatRepository"].createQueryBuilder = jest.fn().mockImplementationOnce(() => createQueryBuilder);
        const data1 = await service.getCatsListByIDs(undefined, 33, 44);
        expect(dependencies["CatRepository"].createQueryBuilder).toBeCalledWith('cats');
        expect(createQueryBuilder.innerJoin).toBeCalledWith('cats.photos', 'photo');
        expect(createQueryBuilder.andWhere).toBeCalledWith("photo.type = :type", {
            type: CatPhotoType.COVER,
        });
        expect(createQueryBuilder.select).toBeCalledWith([
            'cats.id as id',
            'cats.name as name',
            'cats.description as description',
            'photo.fileName as coverFileName',
        ]);
        expect(createQueryBuilder.orderBy).toBeCalledWith('cats.id');
        expect(createQueryBuilder.limit).toBeCalledWith(33);
        expect(createQueryBuilder.offset).toBeCalledWith(44);
        expect(createQueryBuilder.getRawMany).toBeCalledWith();
        expect(data1).toEqual([{id: 111, name: "你好", description: "desc", coverFileName: "1.jpg"}]);
    });

    test('getCatsListByIDs() - Specify ids', async () => {
        const createQueryBuilder = {
            innerJoin: jest.fn(),
            andWhere: jest.fn(),
            select: jest.fn(),
            andWhereInIds: jest.fn(),
            orderBy: jest.fn(),
            setParameter: jest.fn(),
            getRawMany: jest.fn().mockResolvedValueOnce([{id: 111, name: "你好", description: "desc", coverFileName: "1.jpg"}])
        };
        dependencies["CatRepository"].createQueryBuilder = jest.fn().mockImplementationOnce(() => createQueryBuilder);
        const data1 = await service.getCatsListByIDs([1, 2, 3, 4, 5, 6, 7, 8, 9], 5, 4);
        const selectIDs = [5, 6, 7, 8, 9];
        expect(dependencies["CatRepository"].createQueryBuilder).toBeCalledWith('cats');
        expect(createQueryBuilder.innerJoin).toBeCalledWith('cats.photos', 'photo');
        expect(createQueryBuilder.andWhere).toBeCalledWith("photo.type = :type", {
            type: CatPhotoType.COVER,
        });
        expect(createQueryBuilder.select).toBeCalledWith([
            'cats.id as id',
            'cats.name as name',
            'cats.description as description',
            'photo.fileName as coverFileName',
        ]);
        expect(createQueryBuilder.andWhereInIds).toBeCalledWith(selectIDs);
        expect(createQueryBuilder.orderBy).toBeCalledWith('FIELD(cats.id, :ids)');
        expect(createQueryBuilder.setParameter).toBeCalledWith('ids', selectIDs);
        expect(createQueryBuilder.getRawMany).toBeCalledWith();
        expect(data1).toEqual([{id: 111, name: "你好", description: "desc", coverFileName: "1.jpg"}]);
    });

    test('getCatInfoWithSelectedAndCoverPhotos()', async () => {
        dependencies["VectorService"].getVetors = jest.fn().mockResolvedValueOnce({"a": 20, "b": 40});
        dependencies["PhotoService"].getPhotosByCatIDAndType = jest.fn().mockResolvedValue([{"vb": "fd"}, {"vb": "fd2"}]);
        (service as any).getCatInfoByID = jest.fn().mockResolvedValueOnce({"aaa": "bbb"});
        const data1 = await service.getCatInfoWithSelectedAndCoverPhotos(2222);
        expect(dependencies["VectorService"].getVetors).toBeCalledWith(2222);
        expect((service as any).getCatInfoByID).toBeCalledWith(2222);
        expect(dependencies["PhotoService"].getPhotosByCatIDAndType).toBeCalledTimes(2);
        expect(data1).toEqual({
            info: {"aaa": "bbb"},
            vectors: {"a": 20, "b": 40},
            selectedPhotos: [{"vb": "fd"}, {"vb": "fd2"}],
            coverPhoto: {"vb": "fd"}
        });
    });

    test('isCatExists() - Exist', async () => {
        dependencies["CatRepository"].count = jest.fn();
        dependencies["CatRepository"].count.mockResolvedValueOnce(1);
        const data1 = await service.isCatExists(2222);
        expect(dependencies["CatRepository"].count).toBeCalledWith({
            where: {
                id: 2222,
            }
        });
        expect(data1).toBe(true);
    });

    test('isCatExists() - Not Exist', async () => {
        dependencies["CatRepository"].count = jest.fn();
        dependencies["CatRepository"].count.mockResolvedValueOnce(0);
        const data1 = await service.isCatExists(3333);
        expect(dependencies["CatRepository"].count).toBeCalledWith({
            where: {
                id: 3333,
            }
        });
        expect(data1).toBe(false);
    });

    test('searchCatReturnInCatLists()', async () => {
        service.getCatsListByIDs = jest.fn().mockResolvedValueOnce([{}]);
        service.searchCatByKeyword = jest.fn().mockResolvedValueOnce([0, 1]);
        const data1 = await service.searchCatReturnInCatLists("测试", 10, 20);
        expect(service.searchCatByKeyword).toBeCalledWith("测试");
        expect(service.getCatsListByIDs).toBeCalledWith([0, 1], 10, 20);
        expect(data1).toEqual([{}]);
    });

    test('getCatInfoByID()', async () => {
        dependencies["CatRepository"].findOne = jest.fn().mockResolvedValueOnce({"aaa": "bbb"})
        const data1 = await service.getCatInfoByID(3333);
        expect(dependencies["CatRepository"].findOne).toBeCalledWith({
            where: {
                id: 3333
            },
            select: ['status', 'name', 'isNeuter', 'description', 'haunt', 'species']
        });
        expect(data1).toEqual({"aaa": "bbb"});
    });
});
