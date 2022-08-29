import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { PointsTransactionReason } from 'src/modules/user/enums/points-transaction-reason.enum';
import { PointsService } from 'src/modules/user/points/points.service';
import { EntityManager, Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { ShopItem } from '../entities/shop-item.entity';
import { OrderStatusType } from '../enums/order-status-type.enum';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectEntityManager()
        private entityManager: EntityManager,
        private pointsService: PointsService
    ) {}

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
            await orderRepository.insert({
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
                '购买' + item.name + '商品' + quantity + '件',
                manager
            );
        });
    }
}
