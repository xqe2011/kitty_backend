import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiException } from 'src/exceptions/api.exception';
import { PointsTransactionReason } from 'src/modules/user/enums/points-transaction-reason.enum';
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
        "PointsService": MockedObject,
        "SettingService": MockedObject,
        "UsersService": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "OrderRepository": {},
            "EntityManager": {},
            "PointsService": {},
            "SettingService": {},
            "UsersService": {}
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
            insert: jest.fn().mockResolvedValueOnce({ identifiers: [ {id: 3333} ] })
        };
        const itemRepository = {
            findOne: jest.fn().mockResolvedValue({ price: 10, name: "购物袋" })
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
        expect(dependencies["PointsService"].changePoints).toBeCalledWith(2222, -30, PointsTransactionReason.BUY, '订单创建-ID3333', manager);
    });

    test('cancelOrder() - By User and Not Timeout', async () => {
        const now = new Date();
        const orderRepository = {
            findOne: jest.fn().mockResolvedValueOnce({
                id: 3333,
                status: OrderStatusType.STOCKING,
                cancelReason: null,
                totalPrice: 100,
                user: { id: 1 },
                name: "啊这",
                createdDate: now
            }),
            save: jest.fn()
        };
        const manager = {
            getRepository: jest.fn().mockReturnValueOnce(orderRepository)
        };
        dependencies["SettingService"].getSetting = jest.fn().mockResolvedValueOnce(10);
        dependencies["EntityManager"].transaction = jest.fn().mockImplementation(func => func(manager));
        dependencies["PointsService"].changePoints = jest.fn();
        await service.cancelOrder(2222, true);
        expect(dependencies["SettingService"].getSetting).toBeCalledWith("shop.order.cancel_timeout_by_user");
        expect(dependencies["EntityManager"].transaction).toBeCalledTimes(1);
        expect(orderRepository.findOne).toBeCalledWith({
            where: { id: 2222 },
            relations: ['user']
        });
        expect(orderRepository.save).toBeCalledWith({
            id: 3333,
            status: OrderStatusType.CANCEL,
            cancelReason: "用户取消",
            totalPrice: 100,
            user: { id: 1 },
            name: "啊这",
            createdDate: now
        });
        expect(manager.getRepository).toBeCalledTimes(1);
        expect(dependencies["PointsService"].changePoints).toBeCalledWith(1, 100, PointsTransactionReason.REFUND, '订单退款-ID3333', manager);
    });

    test('cancelOrder() - By User and Timeout', async () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - 1);
        const orderRepository = {
            findOne: jest.fn().mockResolvedValueOnce({
                id: 3333,
                status: OrderStatusType.STOCKING,
                cancelReason: null,
                totalPrice: 100,
                user: { id: 1 },
                name: "啊这",
                createdDate: now
            })
        };
        const manager = {
            getRepository: jest.fn().mockReturnValueOnce(orderRepository)
        };
        dependencies["SettingService"].getSetting = jest.fn().mockResolvedValueOnce(0);
        dependencies["EntityManager"].transaction = jest.fn().mockImplementation(func => func(manager));
        dependencies["PointsService"].changePoints = jest.fn();
        try {
            await service.cancelOrder(2222, true);
        } catch(e) {
            expect(e).toBeInstanceOf(ApiException);
        }
        expect(dependencies["SettingService"].getSetting).toBeCalledWith("shop.order.cancel_timeout_by_user");
        expect(dependencies["EntityManager"].transaction).toBeCalledTimes(1);
        expect(orderRepository.findOne).toBeCalledWith({
            where: { id: 2222 },
            relations: ['user']
        });
        expect(manager.getRepository).toBeCalledTimes(1);
    });

    test('cancelOrder() - By User and Not in Cancellable', async () => {
        const now = new Date();
        const orderRepository = {
            findOne: jest.fn().mockResolvedValueOnce({
                id: 3333,
                status: OrderStatusType.CANCEL,
                cancelReason: null,
                totalPrice: 100,
                user: { id: 1 },
                name: "啊这",
                createdDate: now
            })
        };
        const manager = {
            getRepository: jest.fn().mockReturnValueOnce(orderRepository)
        };
        dependencies["EntityManager"].transaction = jest.fn().mockImplementation(func => func(manager));
        dependencies["PointsService"].changePoints = jest.fn();
        try {
            await service.cancelOrder(2222, true);
        } catch(e) {
            expect(e).toBeInstanceOf(ForbiddenException);
        }
        expect(dependencies["EntityManager"].transaction).toBeCalledTimes(1);
        expect(orderRepository.findOne).toBeCalledWith({
            where: { id: 2222 },
            relations: ['user']
        });
        expect(manager.getRepository).toBeCalledTimes(1);
    });

    test('cancelOrder() - By Admin', async () => {
        const now = new Date();
        const orderRepository = {
            findOne: jest.fn().mockResolvedValueOnce({
                id: 3333,
                status: OrderStatusType.STOCKING,
                cancelReason: null,
                totalPrice: 100,
                user: { id: 1 },
                name: "啊这",
                createdDate: now
            }),
            save: jest.fn()
        };
        const manager = {
            getRepository: jest.fn().mockReturnValueOnce(orderRepository)
        };
        dependencies["EntityManager"].transaction = jest.fn().mockImplementation(func => func(manager));
        dependencies["PointsService"].changePoints = jest.fn();
        await service.cancelOrder(2222, false, "缺货");
        expect(dependencies["EntityManager"].transaction).toBeCalledTimes(1);
        expect(orderRepository.findOne).toBeCalledWith({
            where: { id: 2222 },
            relations: ['user']
        });
        expect(orderRepository.save).toBeCalledWith({
            id: 3333,
            status: OrderStatusType.CANCEL,
            cancelReason: "管理员取消-缺货",
            totalPrice: 100,
            user: { id: 1 },
            name: "啊这",
            createdDate: now
        });
        expect(manager.getRepository).toBeCalledTimes(1);
        expect(dependencies["PointsService"].changePoints).toBeCalledWith(1, 100, PointsTransactionReason.REFUND, '订单退款-ID3333', manager);
    });

    test('cancelOrder() - By Admin and Cancelled', async () => {
        const now = new Date();
        const orderRepository = {
            findOne: jest.fn().mockResolvedValueOnce({
                id: 3333,
                status: OrderStatusType.CANCEL,
                cancelReason: null,
                totalPrice: 100,
                user: { id: 1 },
                name: "啊这",
                createdDate: now
            })
        };
        const manager = {
            getRepository: jest.fn().mockReturnValueOnce(orderRepository)
        };
        dependencies["EntityManager"].transaction = jest.fn().mockImplementation(func => func(manager));
        dependencies["PointsService"].changePoints = jest.fn();
        try {
            await service.cancelOrder(2222, false, "缺货");
        } catch(e) {
            expect(e).toBeInstanceOf(ForbiddenException);
        }
        expect(dependencies["EntityManager"].transaction).toBeCalledTimes(1);
        expect(orderRepository.findOne).toBeCalledWith({
            where: { id: 2222 },
            relations: ['user']
        });
        expect(manager.getRepository).toBeCalledTimes(1);
    });

    test('isOrderBelongToUser() - Exists', async () => {
        dependencies["UsersService"].isUserExists = jest.fn().mockResolvedValueOnce(true);
        dependencies["OrderRepository"].count = jest.fn().mockResolvedValueOnce(1);
        const data1 = await service.isOrderBelongToUser(1111, 2222);
        expect(dependencies["OrderRepository"].count).toBeCalledWith({
            id: 1111,
            user: { id: 2222 },
        });
        expect(dependencies["UsersService"].isUserExists).toBeCalledWith(2222);
        expect(data1).toEqual(true);
    });

    test('isOrderBelongToUser() - Not Exists', async () => {
        dependencies["UsersService"].isUserExists = jest.fn().mockResolvedValueOnce(true);
        dependencies["OrderRepository"].count = jest.fn().mockResolvedValueOnce(0);
        const data1 = await service.isOrderBelongToUser(1111, 2222);
        expect(dependencies["OrderRepository"].count).toBeCalledWith({
            id: 1111,
            user: { id: 2222 },
        });
        expect(dependencies["UsersService"].isUserExists).toBeCalledWith(2222);
        expect(data1).toEqual(false);
    });

    test('isOrderExists() - Exists', async () => {
        dependencies["OrderRepository"].count = jest.fn().mockResolvedValueOnce(1);
        const data1 = await service.isOrderExists(1111);
        expect(dependencies["OrderRepository"].count).toBeCalledWith({ id: 1111 });
        expect(data1).toEqual(true);
    });

    test('isOrderExists() - Not Exists', async () => {
        dependencies["OrderRepository"].count = jest.fn().mockResolvedValueOnce(0);
        const data1 = await service.isOrderExists(1111);
        expect(dependencies["OrderRepository"].count).toBeCalledWith({ id: 1111 });
        expect(data1).toEqual(false);
    });

    test('onApplicationBootstrap() - "shop.order.cancel_timeout_by_user" Exists', async () => {
        dependencies["SettingService"].getSetting = jest.fn().mockResolvedValueOnce(true);
        await service.onApplicationBootstrap();
        expect(dependencies["SettingService"].getSetting).toBeCalledWith("shop.order.cancel_timeout_by_user");
    });

    test('onApplicationBootstrap() - "shop.order.cancel_timeout_by_user" Not Exists', async () => {
        dependencies["SettingService"].getSetting = jest.fn().mockResolvedValueOnce("");
        dependencies["SettingService"].createSetting = jest.fn();
        await service.onApplicationBootstrap();
        expect(dependencies["SettingService"].getSetting).toBeCalledWith("shop.order.cancel_timeout_by_user");
        expect(dependencies["SettingService"].createSetting).toBeCalledWith("shop.order.cancel_timeout_by_user", 0, true);
    });
});
