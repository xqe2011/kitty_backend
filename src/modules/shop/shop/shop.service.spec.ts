import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { ShopService } from './shop.service';

describe('ShopService', () => {
    let service: ShopService;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "ShopItemRepository": MockedObject,
        "ShopItemPhotoRepository": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "ShopItemRepository": {},
            "ShopItemPhotoRepository": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [ShopService],
        })
        .useMocker(createMocker(dependencies))
        .compile();

        service = module.get<ShopService>(ShopService);
    });

    test('should be defined', () => {
        expect(service).toBeDefined();
    });

    test('getItemsList()', async () => {
        const createQueryBuilder = {
            andWhere: jest.fn(),
            take: jest.fn(),
            skip: jest.fn(),
            select: jest.fn(),
            getMany: jest.fn().mockResolvedValue([{ id: 111 }, { id: 222 }])
        };
        dependencies["ShopItemRepository"].createQueryBuilder = jest.fn().mockImplementationOnce(() => createQueryBuilder);
        service.getPhotosByItemID = jest.fn().mockImplementation((id, _) => {
            return Promise.resolve([{
                id: id,
                fileName: id
            }]);
        });
        const data1 = await service.getItemsList(10, 0);
        expect(dependencies["ShopItemRepository"].createQueryBuilder).toBeCalledWith('item');
        expect(createQueryBuilder.andWhere).toBeCalledWith({ visible: true });
        expect(createQueryBuilder.take).toBeCalledWith(10);
        expect(createQueryBuilder.skip).toBeCalledWith(0);
        expect(createQueryBuilder.select).toBeCalledWith([
            'item.id',
            'item.name',
            'item.price'
        ]);
        expect(createQueryBuilder.getMany).toBeCalledWith();
        expect(data1).toEqual([{id: 111, coverPhoto: { id: 111, fileName: 111 }}, {id: 222, coverPhoto: { id: 222, fileName: 222 }}]);
    });

    test('getItemInfoByID()', async () => {
        dependencies["ShopItemRepository"].findOne = jest.fn().mockResolvedValue({ id: 2222, name: "2222" });
        const data1 = await service.getItemInfoByID(2222);
        expect(dependencies["ShopItemRepository"].findOne).toBeCalledWith({
            where: { id: 2222 },
            select: ['id', 'description', 'name', 'price']
        });
        expect(data1).toEqual({ id: 2222, name: "2222" });
    });

    test('getPhotosByItemID() - Cover', async () => {
        dependencies["ShopItemPhotoRepository"].find = jest.fn().mockResolvedValue([{ id: 2222, name: "2222" }]);
        const data1 = await service.getPhotosByItemID(2222, true);
        expect(dependencies["ShopItemPhotoRepository"].find).toBeCalledWith({
            where: {
                item: {
                    id: 2222
                },
                isCover: true,
            },
            select: ['id', 'fileName']
        });
        expect(data1).toEqual([{ id: 2222, name: "2222" }]);
    });

    test('getPhotosByItemID() - Not Cover', async () => {
        dependencies["ShopItemPhotoRepository"].find = jest.fn().mockResolvedValue([{ id: 2222, name: "2222" }]);
        const data1 = await service.getPhotosByItemID(2222, false);
        expect(dependencies["ShopItemPhotoRepository"].find).toBeCalledWith({
            where: {
                item: {
                    id: 2222
                },
                isCover: false,
            },
            select: ['id', 'fileName']
        });
        expect(data1).toEqual([{ id: 2222, name: "2222" }]);
    });

    test('getItemInfoWithSelectedAndCoverPhotos()', async () => {
        service.getItemInfoByID = jest.fn().mockImplementation(id => Promise.resolve({ id: 2222, name: "2222" }));
        service.getPhotosByItemID = jest.fn().mockImplementation((id, isCover) => (Promise.resolve([{
            id: id,
            fileName: isCover ? '123' : '456'
        }])));
        const data1 = await service.getItemInfoWithSelectedAndCoverPhotos(2222);
        expect(service.getItemInfoByID).toBeCalledWith(2222);
        expect(data1).toEqual({
            info: { id: 2222, name: "2222" },
            coverPhoto: {
                id: 2222,
                fileName: '123'
            },
            photos: [{
                id: 2222,
                fileName: '456'
            }]
        });
    });

    test('isItemExists() - Exist', async () => {
        dependencies["ShopItemRepository"].count = jest.fn();
        dependencies["ShopItemRepository"].count.mockResolvedValueOnce(1);
        const data1 = await service.isItemExists(2222);
        expect(dependencies["ShopItemRepository"].count).toBeCalledWith({ id: 2222 });
        expect(data1).toBe(true);
    });

    test('isItemExists() - Not Exist', async () => {
        dependencies["ShopItemRepository"].count = jest.fn();
        dependencies["ShopItemRepository"].count.mockResolvedValueOnce(0);
        const data1 = await service.isItemExists(3333);
        expect(dependencies["ShopItemRepository"].count).toBeCalledWith({ id: 3333 });
        expect(data1).toBe(false);
    });
});
