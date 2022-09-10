import { User } from 'src/modules/user/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, DeleteDateColumn, ManyToOne } from 'typeorm';
import { OrderStatusType } from '../enums/order-status-type.enum';
import { ShopItem } from './shop-item.entity';

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    /* 对应的商品 */
    @ManyToOne(() => ShopItem, (shopItem) => shopItem.photos, { nullable: false })
    item: ShopItem;

    /* 单价 */
    @Column({ nullable: false })
    unitPrice: number;

    /* 数量 */
    @Column({ nullable: false })
    quantity: number;

    /* 总价 */
    @Column({ nullable: false })
    totalPrice: number;

    /** 对应的用户  */
    @ManyToOne(() => User, (user) => user.photos, { nullable: false })
    user: User;

    /** 订单状态 */
    @Column({
        type: 'enum',
        enum: OrderStatusType,
        default: OrderStatusType.STOCKING,
        nullable: false,
    })
    status: OrderStatusType;

    /* 订单取消原因 */
    @Column({ nullable: true })
    cancelReason: string;

    @CreateDateColumn()
    createdDate: Date;

    @DeleteDateColumn()
    deleteDate: Date;
}
