import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { Order } from '../entities/order.entity';
import { OrderStatusType } from '../enums/order-status-type.enum';
import { OrderService } from './order.service';

describe('OrderService', () => {
    let service: OrderService;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "OrderRepository": MockedObject,
        "EntityManager": MockedObject,
        "PointsService": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "OrderRepository": {},
            "EntityManager": {},
            "PointsService": {},
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [OrderService],
        })
        .useMocker(createMocker(dependencies))
        .compile();

        service = module.get<OrderService>(OrderService);
    });

    test('should be defined', () => {
        expect(service).toBeDefined();
    });

    test('getOrdersList()', async () => {
        const createQueryBuilder = {
            andWhere: jest.fn(),
            take: jest.fn(),
            skip: jest.fn(),
            select: jest.fn(),
            getRawMany: jest.fn().mockResolvedValue([{ id: 111 }, { id: 222 }])
        };
        dependencies["OrderRepository"].createQueryBuilder = jest.fn().mockImplementationOnce(() => createQueryBuilder);
        const data1 = await service.getOrdersList(2222, 10, 0);
        expect(dependencies["OrderRepository"].createQueryBuilder).toBeCalledWith('order');
        expect(createQueryBuilder.andWhere).toBeCalledWith({ user: { id: 2222 } });
        expect(createQueryBuilder.take).toBeCalledWith(10);
        expect(createQueryBuilder.skip).toBeCalledWith(0);
        expect(createQueryBuilder.select).toBeCalledWith([
            'id',
            'itemId as itemID',
            'unitPrice',
            'quantity',
            'totalPrice',
            'status',
            'createdDate'
        ]);
        expect(createQueryBuilder.getRawMany).toBeCalledWith();
        expect(data1).toEqual([{ id: 111 }, { id: 222 }]);
    });

    test('createOrder()', async () => {
        const orderRepository = {
            insert: jest.fn()
        };
        const itemRepository = {
            findOne: jest.fn().mockResolvedValue({ price: 10 })
        };
        const manager = {
            getRepository: jest.fn().mockImplementation(classType => classType === Order ? orderRepository : itemRepository)
        };
        dependencies["EntityManager"].transaction = jest.fn().mockImplementation(func => func(manager));
        dependencies["PointsService"].changePoints = jest.fn();
        await service.createOrder(2222, 1111, 3);
        expect(dependencies["EntityManager"].transaction).toBeCalledTimes(1);
        expect(orderRepository.insert).toBeCalledWith({
            user: {
                id: 2222,
            },
            item: {
                id: 1111,
            },
            status: OrderStatusType.STOCKING,
            unitPrice: 10,
            totalPrice: 30,
            quantity: 3
        });
        expect(itemRepository.findOne).toBeCalledWith({ id: 1111 });
        expect(manager.getRepository).toBeCalledTimes(2);
    });
});
