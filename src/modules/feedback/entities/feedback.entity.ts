import { Cat } from 'src/modules/cat/entities/cat.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany, DeleteDateColumn } from 'typeorm';
import { FeedbackProgress } from '../enums/feedback-progress.enum';
import { FeedbackType } from '../enums/feedback-type.enum';
import { FeedbackPhoto } from './feedback-photo.entity';

@Entity()
export class Feedback {
    @PrimaryGeneratedColumn()
    id: number;

    /** 反馈类型 */
    @Column({
        type: 'enum',
        enum: FeedbackType,
        nullable: false,
    })
    type: FeedbackType;

    /** 进度 */
    @Column({
        type: 'enum',
        enum: FeedbackProgress,
        nullable: false,
        default: FeedbackProgress.PENDING
    })
    progress: FeedbackProgress;

    /* 反馈内容 */
    @Column({ nullable: false, type: "text" })
    content: string;

    /** 对应的用户  */
    @ManyToOne(() => User, (user) => user.feedbacks, { nullable: false })
    user: User;

    /** 对应的猫咪  */
    @ManyToOne(() => Cat, (cat) => cat.feedbacks)
    cat: Cat;

    /** 对应的照片  */
    @OneToMany(() => FeedbackPhoto, (feedbackPhoto) => feedbackPhoto.feedback)
    photos: FeedbackPhoto;

    @CreateDateColumn()
    createdDate: Date;

    @DeleteDateColumn()
    deleteDate: string;
}
