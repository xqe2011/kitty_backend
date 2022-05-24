import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileService } from 'src/modules/file/file/file.service';
import { Repository } from 'typeorm';
import { CatPhoto } from '../entities/cat-photo.entity';
import { CatPhotoType } from '../enums/cat-photo-type.enum';

@Injectable()
export class PhotoService {
    constructor(
        @InjectRepository(CatPhoto)
        private catPhotoRepository: Repository<CatPhoto>,
        private fileService: FileService,
    ) {}

    /**
     * 创建用户照片
     * @param userID 用户ID
     * @param catID 猫咪ID
     * @param fileToken 文件TOKEN
     * @param comment 照片评论
     * @param compassAngle 指南针角度
     * @param latitude 纬度
     * @param longitude 经度
     * @param positionAccuration 位置精度
     */
    async createUserPhoto(userID: number, catID: number, fileToken: string, comment: string, compassAngle: number, latitude: number, longitude: number, positionAccuration: number) {
        const rawFileName = this.fileService.getFileNameByToken(fileToken);
        if (
            (await this.catPhotoRepository.count({
                user: {
                    id: userID,
                },
                rawFileName: rawFileName,
            })) > 0
        ) {
            throw new ConflictException('File Name exists!');
        }
        await this.catPhotoRepository.insert({
            user: {
                id: userID,
            },
            cat: {
                id: catID,
            },
            comment: comment,
            rawFileName: rawFileName,
            compassAngle: compassAngle,
            positionAccuration: positionAccuration,
            position: longitude && latitude ? `POINT(${longitude} ${latitude})` : undefined,
        });
    }

    /**
     * 检查照片存在
     * @param id 照片ID
     * @returns 是否存在
     */
    async isPhotoExists(id: number) {
        return (
            (await this.catPhotoRepository.count({
                where: {
                    id: id,
                },
            })) > 0
        );
    }

    /**
     * 通过猫咪ID和类型获取照片集
     * @param catID 猫咪ID
     * @param type 照片类型
     * @returns 猫咪照片集
     */
    async getPhotosByCatIDAndType(catID: number, type: CatPhotoType, limit: number, start: number) {
        const queryBuilder = this.catPhotoRepository.createQueryBuilder('photo');
        queryBuilder.andWhere({
            cat: {
                id: catID
            },
            type: type
        });
        queryBuilder.skip(start);
        queryBuilder.take(limit);
        queryBuilder.select(['id', 'rawFileName', 'fileName', 'comment', 'createdDate', 'userId as userID']);
        const data = await queryBuilder.getRawMany();
        return data as (Pick<CatPhoto, 'id' | 'createdDate' | 'comment' | 'fileName' | 'rawFileName'> | { userID: number })[];
    }
}
