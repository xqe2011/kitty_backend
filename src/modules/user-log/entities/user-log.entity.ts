import { User } from 'src/modules/user/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { UserLogType } from '../enums/user-log-type.enum';

@Entity()
export class UserLog {
    @PrimaryGeneratedColumn()
    id: number;

    /** 对应的用户  */
    @ManyToOne(() => User, (user) => user.logs)
    user: User;

    /** 操作日记类型  */
    @Column({
        type: 'enum',
        enum: UserLogType,
        nullable: false,
    })
    type: UserLogType;

    /** 日记详细数据 */
    @Column({
        type: 'json',
    })
    message: any;

    /** 日记发生的时间  */
    @Column()
    createdDate: Date;
}
