import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, DeleteDateColumn, Index, } from 'typeorm';

@Entity()
export class Setting {
    @PrimaryGeneratedColumn()
    id: number;

    /** 键 */
    @Index()
    @Column({ nullable: false })
    key: string;

    /** 值  */
    @Column({ type: 'json' })
    value: any;

    /** 是否可以被客户端直接获取 */
    @Column({
        default: false,
        nullable: false,
    })
    canClientFetch: boolean;

    @CreateDateColumn()
    createdDate: Date;

    @DeleteDateColumn()
    deleteDate: Date;
}
