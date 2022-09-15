import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { ManageLogType } from '../enums/manage-log-type.enum';

@Entity()
export class ManageLog {
    @PrimaryGeneratedColumn()
    id: number;

    /** 对应的用户  */
    @Column()
    userID: number;

    /** 操作日记类型  */
    @Column({
        type: 'enum',
        enum: ManageLogType,
        nullable: false,
    })
    type: ManageLogType;

    /** 日记详细数据 */
    @Column({
        type: 'json',
    })
    message: any;

    /** 日记发生的时间  */
    @CreateDateColumn()
    createdDate: Date;
}
