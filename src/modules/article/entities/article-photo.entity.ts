import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, DeleteDateColumn, } from 'typeorm';
import { Article } from './article.entity';

@Entity()
export class ArticlePhoto {
    @PrimaryGeneratedColumn()
    id: number;

    /** 对应的文章  */
    @ManyToOne(() => Article, (article) => article.photos, { nullable: false })
    article: Article;

    /* 是否为封面图 */
    @Column({ default: false })
    isCover: boolean;

    /** 照片文件名  */
    @Column({ nullable: true })
    fileName: string;

    @CreateDateColumn()
    createdDate: Date;

    @DeleteDateColumn()
    deleteDate: Date;
}
