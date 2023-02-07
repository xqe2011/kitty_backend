import { User } from 'src/modules/user/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, DeleteDateColumn } from 'typeorm';
import { ReportEntityType } from '../enums/report-entity-type.enum';
import { ReportType } from '../enums/report-type.enum';

@Entity()
export class Report {
    @PrimaryGeneratedColumn()
    id: number;

    /** 举报类型 */
    @Column({
        type: 'enum',
        enum: ReportType,
        nullable: false,
    })
    type: ReportType;

    /* 举报内容 */
    @Column({ nullable: false, type: "text" })
    content: string;

    /** 对应的用户  */
    @ManyToOne(() => User, (user) => user.reports, { nullable: false })
    user: User;

    /** 关联的实体类型 */
    @Column({
        type: 'enum',
        enum: ReportEntityType,
        nullable: false,
    })
    entityType: ReportEntityType;

    /** 关联的实体ID  */
    @Column({ nullable: false })
    entityID: number;

    @CreateDateColumn()
    createdDate: Date;

    @DeleteDateColumn()
    deleteDate: string;
}
