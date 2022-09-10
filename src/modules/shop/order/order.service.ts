import { ForbiddenException, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { ApiException } from 'src/exceptions/api.exception';
import { Error } from 'src/exceptions/enums/error.enum';
import { SettingService } from 'src/modules/setting/setting/setting.service';
import { PointsTransactionReason } from 'src/modules/user/enums/points-transaction-reason.enum';
import { PointsService } from 'src/modules/user/points/points.service';
import { UsersService } from 'src/modules/user/user/users.service';
import { EntityManager, Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { ShopItem } from '../entities/shop-item.entity';
import { OrderStatusType } from '../enums/order-status-type.enum';

@Injectable()
export class OrderService implements OnApplicationBootstrap{
    constructor(
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectEntityManager()
        private entityManager: EntityManager,
        private pointsService: PointsService,
        private settingService: SettingService,
        private usersService: UsersService
    ) {}

    async onApplicationBootstrap() {
        if (await this.settingService.getSetting("shop.order.cancel_timeout_by_user") === "") {
            await this.settingService.createSetting("shop.order.cancel_timeout_by_user", 0, true);
        }
    }

    /**
     * 获取用户订单1列表
     * @param id 用户ID
     * @param limit 限制数量
     * @param start 开始位置
     * @returns 订单信息
     */
    async getOrdersList(userID: number, limit: number, start: number) {
        const queryBuildinger = this.orderRepository.createQueryBuilder('order');
        queryBuildinger.andWhere({ user: { id: userID } });
        queryBuildinger.select([
            'id',
            'itemId as itemID',
            'unitPrice',
            'quantity',
            'totalPrice',
            'status',
            'createdDate'
        ]);
        queryBuildinger.take(limit);
        queryBuildinger.skip(start);
        return await queryBuildinger.getRawMany() as {
            id: number;
            itemID: number;
            unitPrice: number;
            quantity: number;
            totalPrice: number;
            status: OrderStatusType;
            createdDate: string;
        }[];
    }

    /**
     * 创建订单
     * @param userID 用户ID
     * @param itemID 商品ID
     * @param quantity 数量
     */
    async createOrder(userID: number, itemID: number, quantity: number) {
        await this.entityManager.transaction(async manager => {
            const orderRepository = manager.getRepository<Order>(Order);
            const itemRepository = manager.getRepository<ShopItem>(ShopItem);
            const item = await itemRepository.findOne({ id: itemID });
            const unitPrice = item.price;
            const totalPrice = unitPrice * quantity;
            const insertInfo = await orderRepository.insert({
                user: {
                    id: userID,
                },
                item: {
                    id: itemID,
                },
                status: OrderStatusType.STOCKING,
                unitPrice: unitPrice,
                totalPrice: totalPrice,
                quantity
            });
            await this.pointsService.changePoints(
                userID,
                -totalPrice,
                PointsTransactionReason.BUY,
                "订单创建-ID" + insertInfo.identifiers[0].id,
                manager
            );
        });
    }

    /**
     * 取消订单
     * @param id 订单ID
     * @param byUser 是否为用户取消
     * @param reason 原因,若为用户取消则无需携带
     */
    async cancelOrder(id: number, byUser: boolean, reason?: string) {
        await this.entityManager.transaction(async manager => {
            const orderRepository = manager.getRepository<Order>(Order);
            const orderInfo = await orderRepository.findOne({
                where: { id },
                relations: ['user']
            });
            if (byUser) {
                if (orderInfo.status != OrderStatusType.STOCKING && orderInfo.status != OrderStatusType.PENDING_RECEIPT) {
                    throw new ForbiddenException("This order is not allowed to cancel!");
                }
                if (Math.floor((new Date().getTime() - orderInfo.createdDate.getTime()) / 1000) > await this.settingService.getSetting("shop.order.cancel_timeout_by_user")) {
                    throw new ApiException(Error.CANCEL_ORDER_TIMEOUT);
                }
                orderInfo.cancelReason = "用户取消";
            } else {
                if (orderInfo.status == OrderStatusType.CANCEL) {
                    throw new ForbiddenException("This order is not allowed to cancel!");
                }
                orderInfo.cancelReason = "管理员取消-" + reason;
            }
            orderInfo.status = OrderStatusType.CANCEL;
            await orderRepository.save(orderInfo);
            console.log(orderInfo)
            /* 退款 */
            await this.pointsService.changePoints(orderInfo.user.id, orderInfo.totalPrice, PointsTransactionReason.REFUND, "订单退款-ID" + orderInfo.id, manager);
        });
    }

    /**
     * 判断某订单ID是否属于某用户
     * @param id 评论ID
     * @param userID 订单ID
     * @returns 是否属于
     */
     async isOrderBelongToUser(id: number, userID: number) {
        if (!this.usersService.isUserExists(userID)) return false;
        return (await this.orderRepository.count({
            id: id,
            user: { id: userID },
        })) > 0;
    }

    /**
     * 判断订单ID是否存在
     * @param id 订单ID
     * @returns 是否存在
     */
    async isOrderExists(id: number) {
        return (await this.orderRepository.count({ id: id })) > 0;
    }
}
