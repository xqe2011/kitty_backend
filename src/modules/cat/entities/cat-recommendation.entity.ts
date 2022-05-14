import { User } from 'src/modules/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, DeleteDateColumn, Column, } from 'typeorm';

@Entity()
export class CatRecommendation {
    @PrimaryGeneratedColumn()
    id: number;

    /** 对应的用户  */
    @ManyToOne(() => User, (user) => user.catRecommendations)
    user: User;

    /** 对应的猫咪  */
    @Column({
        type: 'json',
    })
    cats: number[];

    @CreateDateColumn()
    createdDate: Date;

    @DeleteDateColumn()
    deleteDate: Date;
}
