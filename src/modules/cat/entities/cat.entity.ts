import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany, } from 'typeorm';
import { CatStatusType } from '../enums/cat-status-type.enum';
import { CatPhoto } from './cat-photo.entity';
import { CatVector } from './cat-vector.entity';

@Entity()
export class Cat {
    @PrimaryGeneratedColumn()
    id: number;

    /** 猫咪状态 */
    @Column({
        type: 'enum',
        enum: CatStatusType,
        default: CatStatusType.NORMAL,
        nullable: false,
    })
    status: CatStatusType;

    /** 猫咪名称 */
    @Column({
        nullable: false,
    })
    name: string;

    /** 猫咪物种 */
    @Column({
        default: '',
        nullable: false,
    })
    species: string;

    /** 猫咪是否已经绝育  */
    @Column({
        default: false,
        nullable: false,
    })
    isNeuter: boolean;

    /** 猫咪描述 */
    @Column({
        default: '',
        nullable: false,
    })
    description: string;

    /** 猫咪出没地点 */
    @Column({
        default: '',
        nullable: false,
    })
    haunt: string;

    /** 猫咪对应的照片 */
    @OneToMany(() => CatPhoto, (catPhoto) => catPhoto.cat)
    photos: CatPhoto[];

    /** 猫咪对应的向量 */
    @OneToMany(() => CatVector, (catVector) => catVector.cat)
    vectors: CatVector[];

    @CreateDateColumn()
    createdDate: Date;
}
