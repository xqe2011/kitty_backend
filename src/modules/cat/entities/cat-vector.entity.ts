import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, Index, } from 'typeorm';
import { CatVectorType } from '../enums/cat-vector-type.enum';
import { Cat } from './cat.entity';

@Entity()
export class CatVector {
    @PrimaryGeneratedColumn()
    id: number;

    /** 对应的猫咪  */
    @ManyToOne(() => Cat, (cat) => cat.vectors)
    @Index()
    cat: Cat;

    /** 向量类型  */
    @Column({
        type: 'enum',
        enum: CatVectorType,
        nullable: false,
    })
    type: CatVectorType;

    /** 向量比例,0-100 */
    @Column({
        default: 100,
        nullable: false,
    })
    percent: number;

    @CreateDateColumn()
    createdDate: Date;
}
