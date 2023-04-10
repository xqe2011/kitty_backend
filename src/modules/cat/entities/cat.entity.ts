import { Feedback } from 'src/modules/feedback/entities/feedback.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany, DeleteDateColumn, } from 'typeorm';
import { CatStatusType } from '../enums/cat-status-type.enum';
import { CatPhoto } from './cat-photo.entity';
import { CatRecommendation } from './cat-recommendation.entity';
import { CatTag } from './cat-tag.entity';

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

    /** 猫咪对应的TAG */
    @OneToMany(() => CatTag, (catTag) => catTag.cat)
    tags: CatTag[];

    /** 猫咪对应的反馈 */
    @OneToMany(() => Feedback, (feedback) => feedback.cat)
    feedbacks: Feedback[];

    /** 猫咪对应的推荐 */
    @OneToMany(() => CatRecommendation, (catRecommendation) => catRecommendation.cat)
    recommendations: CatRecommendation[];

    @CreateDateColumn()
    createdDate: Date;

    @DeleteDateColumn()
    deleteDate: Date;
}
