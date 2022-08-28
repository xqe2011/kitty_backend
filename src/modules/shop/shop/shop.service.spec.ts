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
            leftJoinAndSelect: jest.fn(),
            andWhere: jest.fn(),
            take: jest.fn(),
            skip: jest.fn(),
            select: jest.fn(),
            getMany: jest.fn().mockResolvedValue([{ id: 111 }, { id: 222 }])
        };
        dependencies["ShopItemRepository"].createQueryBuilder = jest.fn().mockImplementationOnce(() => createQueryBuilder);
        dependencies["ShopItemPhotoRepository"].findOne = jest.fn().mockImplementation(param => {
            expect(param).toEqual({
                where: {
                    item: {
                        id: expect.any(Number)
                    },
                    isCover: true,
                },
                select: ['id', 'fileName']
            });
            return { id: param.where.item.id, fileName: param.where.item.id }
        });
        const data1 = await service.getItemsList(10, 0);
        expect(dependencies["ShopItemRepository"].createQueryBuilder).toBeCalledWith('item');
        expect(createQueryBuilder.leftJoinAndSelect).toBeCalledWith('item.photos', 'photo');
        expect(createQueryBuilder.andWhere).toBeCalledWith({ visible: true });
        expect(createQueryBuilder.take).toBeCalledWith(10);
        expect(createQueryBuilder.skip).toBeCalledWith(0);
        expect(createQueryBuilder.select).toBeCalledWith([
            'item.id',
            'item.name',
            'item.description',
            'item.price',
            'photo.id',
            'photo.fileName'
        ]);
        expect(createQueryBuilder.getMany).toBeCalledWith();
        expect(data1).toEqual([{id: 111, coverPhoto: { id: 111, fileName: 111 }}, {id: 222, coverPhoto: { id: 222, fileName: 222 }}]);
    });
});
