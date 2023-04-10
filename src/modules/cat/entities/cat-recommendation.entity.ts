import { User } from 'src/modules/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { Cat } from './cat.entity';

@Entity()
export class CatRecommendation {
    @PrimaryGeneratedColumn()
    id: number;

    /** 对应的用户  */
    @ManyToOne(() => User, (user) => user.catRecommendations)
    user: User;

    /** 对应的猫咪  */
    @ManyToOne(() => Cat, (cat) => cat.recommendations)
    cat: Cat;

    @CreateDateColumn()
    createdDate: Date;
}
