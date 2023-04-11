import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { ShopItemPhoto } from '../entities/shop-item-photo.entity';
import { ShopItem } from '../entities/shop-item.entity';
import { ShopService } from './shop.service';

describe('ShopService', () => {
    let service: ShopService;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "ShopItemRepository": MockedObject,
        "ShopItemPhotoRepository": MockedObject,
        "FileService": MockedObject,
        "EntityManager": MockedObject,
        "LikeableEntityService": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "ShopItemRepository": {},
            "ShopItemPhotoRepository": {},
            "FileService": {},
            "EntityManager": {},
            "LikeableEntityService": {}
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

    test('getItemsList() - Only Visible', async () => {
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
        const data1 = await service.getItemsList(true, 10, 0);
        expect(dependencies["ShopItemRepository"].createQueryBuilder).toBeCalledWith('item');
        expect(createQueryBuilder.andWhere).toBeCalledWith({ visible: true });
        expect(createQueryBuilder.take).toBeCalledWith(10);
        expect(createQueryBuilder.skip).toBeCalledWith(0);
        expect(createQueryBuilder.select).toBeCalledWith([
            'item.id',
            'item.name',
            'item.price',
            'item.visible',
            'item.likeableEntityID'
        ]);
        expect(createQueryBuilder.getMany).toBeCalledWith();
        expect(data1).toEqual([{id: 111, coverPhoto: { id: 111, fileName: 111 }}, {id: 222, coverPhoto: { id: 222, fileName: 222 }}]);
    });

    test('getItemsList() - Not Only Visible', async () => {
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
        const data1 = await service.getItemsList(false, 10, 0);
        expect(dependencies["ShopItemRepository"].createQueryBuilder).toBeCalledWith('item');
        expect(createQueryBuilder.andWhere).toBeCalledTimes(0);
        expect(createQueryBuilder.take).toBeCalledWith(10);
        expect(createQueryBuilder.skip).toBeCalledWith(0);
        expect(createQueryBuilder.select).toBeCalledWith([
            'item.id',
            'item.name',
            'item.price',
            'item.visible',
            'item.likeableEntityID'
        ]);
        expect(createQueryBuilder.getMany).toBeCalledWith();
        expect(data1).toEqual([{id: 111, coverPhoto: { id: 111, fileName: 111 }}, {id: 222, coverPhoto: { id: 222, fileName: 222 }}]);
    });

    test('getItemInfoByID()', async () => {
        dependencies["ShopItemRepository"].findOne = jest.fn().mockResolvedValue({ id: 2222, name: "2222" });
        const data1 = await service.getItemInfoByID(2222);
        expect(dependencies["ShopItemRepository"].findOne).toBeCalledWith({
            where: { id: 2222 },
            select: ['id', 'description', 'name', 'price', 'likeableEntityID']
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

    test('isItemPhotoExists() - Exist', async () => {
        dependencies["ShopItemPhotoRepository"].count = jest.fn();
        dependencies["ShopItemPhotoRepository"].count.mockResolvedValueOnce(1);
        const data1 = await service.isItemPhotoExists(2222);
        expect(dependencies["ShopItemPhotoRepository"].count).toBeCalledWith({ id: 2222 });
        expect(data1).toBe(true);
    });

    test('isItemPhotoExists() - Not Exist', async () => {
        dependencies["ShopItemPhotoRepository"].count = jest.fn();
        dependencies["ShopItemPhotoRepository"].count.mockResolvedValueOnce(0);
        const data1 = await service.isItemPhotoExists(3333);
        expect(dependencies["ShopItemPhotoRepository"].count).toBeCalledWith({ id: 3333 });
        expect(data1).toBe(false);
    });

    test('updateItemPhoto()', async () => {
        dependencies["ShopItemPhotoRepository"].update = jest.fn();
        await service.updateItemPhoto(3333, true);
        expect(dependencies["ShopItemPhotoRepository"].update).toBeCalledWith({ id: 3333 }, { isCover: true });
    });

    test('updateItem()', async () => {
        dependencies["ShopItemRepository"].update = jest.fn();
        await service.updateItem(3333, "ab", "bc", 123, true);
        expect(dependencies["ShopItemRepository"].update).toBeCalledWith({ id: 3333 }, { name: "ab", description: "bc", price: 123, visible: true });
    });

    test('addPhotoToItem()', async () => {
        dependencies["FileService"].getFileNameByToken = jest.fn().mockReturnValue("1.jpg");
        dependencies["ShopItemPhotoRepository"].save = jest.fn();
        await service.addPhotoToItem(3333, "filetoken");
        expect(dependencies["FileService"].getFileNameByToken).toBeCalledWith("filetoken");
        const photo = new ShopItemPhoto();
        photo.item = { id: 3333 } as any;
        photo.fileName = "1.jpg";
        expect(dependencies["ShopItemPhotoRepository"].save).toBeCalledWith(photo);
    });

    test('deletePhoto() - Without Transaction', async () => {
        dependencies["EntityManager"].softDelete = jest.fn();
        await service.deletePhoto(3333, undefined);
        expect(dependencies["EntityManager"].softDelete).toBeCalledWith(ShopItemPhoto, { id: 3333 });
    });

    test('deletePhoto() - With Transaction', async () => {
        const manager = {
            softDelete: jest.fn()
        };
        await service.deletePhoto(3333, manager as any);
        expect(manager.softDelete).toBeCalledWith(ShopItemPhoto, { id: 3333 });
    });

    test('deleteItem()', async () => {
        const manager = {
            findOne: jest.fn().mockResolvedValue({ likeableEntityID: 111 }),
            softDelete: jest.fn()
        };
        dependencies["EntityManager"].transaction = jest.fn().mockImplementation(func => func(manager));
        dependencies["LikeableEntityService"].deleteEntity = jest.fn();
        await service.deleteItem(3333);
        expect(manager.softDelete.mock.calls).toEqual([
            [ShopItemPhoto, { item: { id: 3333 } }],
            [ShopItem, { id: 3333 }],
        ]);
        expect(dependencies["LikeableEntityService"].deleteEntity).toBeCalledWith(111, manager);
    });

    test('createItem()', async () => {
        const manager = {
            save: jest.fn().mockResolvedValueOnce({ id: 222 })
        };
        dependencies["EntityManager"].transaction = jest.fn().mockImplementation(func => func(manager));
        dependencies["LikeableEntityService"].createEntity = jest.fn().mockResolvedValueOnce(111);
        const data = await service.createItem("abcd", "uiuiu", 2929, true);
        const item = new ShopItem();
        item.name = "abcd";
        item.description = "uiuiu";
        item.price = 2929;
        item.visible = true;
        item.likeableEntityID = 111;
        expect(dependencies["LikeableEntityService"].createEntity).toBeCalledWith(false, manager);
        expect(manager.save).toBeCalledWith(item);
        expect(data).toEqual(222);
    });
});
