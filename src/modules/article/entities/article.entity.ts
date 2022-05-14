import { Entity, PrimaryGeneratedColumn, CreateDateColumn, DeleteDateColumn, Column, } from 'typeorm';

@Entity()
export class Article {
    @PrimaryGeneratedColumn()
    id: number;

    /** 是否可以为列表接口列出  */
    @Column({ nullable: false, default: true })
    canBeListed: boolean;

    /** 文章封面文件名  */
    @Column({ default: 0 })
    coverFileName: string;

    /** 文章概述  */
    @Column({ default: '' })
    summary: string;

    /** 文章标题  */
    @Column({ nullable: false })
    title: string;

    /** 文章内容  */
    @Column({ nullable: false })
    content: string;

    @CreateDateColumn()
    createdDate: Date;

    @DeleteDateColumn()
    deleteDate: Date;
}
