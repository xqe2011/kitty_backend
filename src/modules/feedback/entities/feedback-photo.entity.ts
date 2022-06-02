import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, DeleteDateColumn } from 'typeorm';
import { Feedback } from './feedback.entity';

@Entity()
export class FeedbackPhoto {
    @PrimaryGeneratedColumn()
    id: number;

    /** 对应的猫咪  */
    @ManyToOne(() => Feedback, (feedback) => feedback.photos)
    feedback: Feedback;

    /* 照片 */
    @Column({ nullable: false })
    fileName: string;

    @CreateDateColumn()
    createdDate: Date;

    @DeleteDateColumn()
    deleteDate: string;
}
