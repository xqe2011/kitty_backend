import { Entity, PrimaryGeneratedColumn, CreateDateColumn, DeleteDateColumn, Column, OneToMany, } from 'typeorm';
import { ArticlePhoto } from './article-photo.entity';

@Entity()
export class Article {
    @PrimaryGeneratedColumn()
    id: number;
    
    /** 文章概述  */
    @Column({ default: '' })
    summary: string;

    /** 文章标题  */
    @Column({ nullable: false })
    title: string;

    /** 文章URL  */
    @Column({ nullable: false })
    url: string;

    /** 商品对应的照片 */
    @OneToMany(() => ArticlePhoto, (articlePhoto) => articlePhoto.article)
    photos: ArticlePhoto[];

    @CreateDateColumn()
    createdDate: Date;

    @DeleteDateColumn()
    deleteDate: Date;
}
