import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, DeleteDateColumn, Index, OneToMany, } from 'typeorm';
import { Order } from './order.entity';
import { ShopItemPhoto } from './shop-item-photo.entity';

@Entity()
export class ShopItem {
    @PrimaryGeneratedColumn()
    id: number;

    /** 商品名称 */
    @Index()
    @Column({ nullable: false })
    name: string;

    /** 商品介绍  */
    @Column({ nullable: false })
    description: string;

    /* 价格 */
    @Column({ nullable: false })
    price: number;

    /** 是否可见 */
    @Column({
        default: true,
        nullable: false,
    })
    visible: boolean;

    /** 商品对应的照片 */
    @OneToMany(() => ShopItemPhoto, (shopItemPhoto) => shopItemPhoto.item)
    photos: ShopItemPhoto[];

    /** 商品对应的订单 */
    @OneToMany(() => Order, (order) => order.item)
    orders: Order[];

    @CreateDateColumn()
    createdDate: Date;

    @DeleteDateColumn()
    deleteDate: Date;
}
