import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, Index, DeleteDateColumn, } from 'typeorm';
import { Cat } from './cat.entity';

@Entity()
export class CatTag {
    @PrimaryGeneratedColumn()
    id: number;

    /** 对应的猫咪  */
    @ManyToOne(() => Cat, (cat) => cat.tags)
    @Index()
    cat: Cat;

    /* 标签名称 */
    @Column({ nullable: false })
    name: string;

    @CreateDateColumn()
    createdDate: Date;

    @DeleteDateColumn()
    deleteDate: Date;
}
