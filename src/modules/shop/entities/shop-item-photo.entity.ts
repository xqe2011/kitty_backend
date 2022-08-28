import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, DeleteDateColumn, } from 'typeorm';
import { ShopItem } from './shop-item.entity';

@Entity()
export class ShopItemPhoto {
    @PrimaryGeneratedColumn()
    id: number;

    /** 对应的商品  */
    @ManyToOne(() => ShopItem, (shopItem) => shopItem.photos, { nullable: false })
    item: ShopItem;

    /* 是否为封面图 */
    @Column({ default: false })
    isCover: boolean;

    /** 照片文件名  */
    @Column({ nullable: true })
    fileName: string;

    @CreateDateColumn()
    createdDate: Date;

    @DeleteDateColumn()
    deleteDate: Date;
}
