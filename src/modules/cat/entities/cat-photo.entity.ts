import { User } from 'src/modules/user/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, DeleteDateColumn, } from 'typeorm';
import { CatPhotoType } from '../enums/cat-photo-type.enum';
import { Cat } from './cat.entity';

@Entity()
export class CatPhoto {
    @PrimaryGeneratedColumn()
    id: number;

    /** 对应的用户  */
    @ManyToOne(() => User, (user) => user.photos, { nullable: false })
    user: User;

    /** 对应的猫咪  */
    @ManyToOne(() => Cat, (cat) => cat.vectors)
    cat: Cat;

    /** 猫咪图片分类 */
    @Column({
        type: 'enum',
        enum: CatPhotoType,
        default: CatPhotoType.PEDNING,
        nullable: false,
    })
    type: CatPhotoType;

    /** 拍照时的位置 */
    @Column({ type: 'geometry', nullable: true })
    position: string;

    /** 拍照时的位置精确度,米为单位 */
    @Column({ nullable: true })
    positionAccuration: number;

    /** 拍照时指南针角度 */
    @Column({ nullable: true })
    compassAngle: number;

    /* 照片评论 */
    @Column({ nullable: true, type: "text" })
    comment: string;

    /** 原图照片文件名  */
    @Column({ nullable: true })
    rawFileName: string;

    /** 展示的照片文件名  */
    @Column({ nullable: true })
    fileName: string;

    /** 评论区ID */
    commentsAreaID: number;

    @CreateDateColumn()
    createdDate: Date;

    @DeleteDateColumn()
    deleteDate: Date;
}
