import { ConflictException, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { CommentsAreaService } from 'src/modules/comment/comments-area/comments-area.service';
import { FileService } from 'src/modules/file/file/file.service';
import { LikeableEntityService } from 'src/modules/like/likeable-entity/likeable-entity.service';
import { SettingService } from 'src/modules/setting/setting/setting.service';
import { EntityManager, Repository } from 'typeorm';
import { CatPhoto } from '../entities/cat-photo.entity';
import { CatPhotoType } from '../enums/cat-photo-type.enum';

@Injectable()
export class PhotoService implements OnApplicationBootstrap{
    constructor(
        @InjectRepository(CatPhoto)
        private catPhotoRepository: Repository<CatPhoto>,
        private fileService: FileService,
        private settingService: SettingService,
        @InjectEntityManager()
        private entityManager: EntityManager,
        private commentsAreaService: CommentsAreaService,
        private likeableEntityService: LikeableEntityService
    ) {}

    async onApplicationBootstrap() {
        if (await this.settingService.getSetting("cats.photo.censor") === "") {
            await this.settingService.createSetting("cats.photo.censor", true, true);
        }
    }

    /**
     * 创建用户照片,会自动根据是否启用审核填充对应的类型
     * @param userID 用户ID
     * @param catID 猫咪ID
     * @param fileToken 文件TOKEN,若为undefined则不上传照片
     * @param comment 照片评论
     * @param compassAngle 指南针角度
     * @param latitude 纬度
     * @param longitude 经度
     * @param positionAccuration 位置精度
     */
    async createUserPhoto(userID: number, catID: number, fileToken: string, comment: string, compassAngle: number, latitude: number, longitude: number, positionAccuration: number) {
        const rawFileName = typeof fileToken == "string" ? this.fileService.getFileNameByToken(fileToken) : undefined;
        if (
            rawFileName != undefined && 
            (await this.catPhotoRepository.count({
                user: {
                    id: userID,
                },
                rawFileName: rawFileName,
            })) > 0
        ) {
            throw new ConflictException('File Name exists!');
        }
        const enableCensor = await this.settingService.getSetting("cats.photo.censor");
        await this.entityManager.transaction(async manager => {
            const commentsAreaID = await this.commentsAreaService.createArea(manager);
            const likeableEntityID = await this.likeableEntityService.createEntity(false, manager);
            await manager.insert(CatPhoto, {
                type: enableCensor ? CatPhotoType.PEDNING : CatPhotoType.OTHERS,
                user: {
                    id: userID,
                },
                cat: {
                    id: catID,
                },
                commentsAreaID,
                likeableEntityID,
                comment,
                rawFileName,
                fileName: rawFileName,
                compassAngle,
                positionAccuration,
                position: longitude && latitude ? `POINT(${longitude} ${latitude})` : undefined,
            });
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
     * 通过猫咪ID和类型获取照片集,默认按照时间倒序
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
        queryBuilder.select(['id', 'rawFileName', 'fileName', 'comment', 'createdDate', 'userId as userID', 'commentsAreaID', 'likeableEntityID']);
        queryBuilder.orderBy("createdDate", "DESC");
        const data = await queryBuilder.getRawMany();
        return data as (Pick<CatPhoto, 'id' | 'createdDate' | 'comment' | 'fileName' | 'rawFileName' | 'commentsAreaID'| 'likeableEntityID'> & { userID: number })[];
    }

    /**
     * 获取所有照片,默认按照时间倒序
     * @returns 猫咪照片集
     */
    async getPhotos(limit: number, start: number) {
        const queryBuilder = this.catPhotoRepository.createQueryBuilder('photo');
        queryBuilder.skip(start);
        queryBuilder.take(limit);
        queryBuilder.select(['id', 'rawFileName', 'fileName', 'comment', 'createdDate', 'userId as userID', 'type', 'commentsAreaID', 'likeableEntityID']);
        queryBuilder.orderBy("createdDate", "DESC");
        const data = await queryBuilder.getRawMany();
        return data as (Pick<CatPhoto, 'id' | 'createdDate' | 'comment' | 'fileName' | 'rawFileName' | 'commentsAreaID' | 'type' | 'commentsAreaID' | 'likeableEntityID'> & { userID: number })[];
    }

    /**
     * 更新照片信息
     * @param id 照片ID
     * @param type 照片类型
     */
    async updatePhotoInfo(id: number, type: CatPhotoType) {
        await this.catPhotoRepository.update(id, { type });
    }

    /**
     * 删除照片
     *
     * @param id 照片ID
     */
    async deletePhoto(id: number) {
        await this.catPhotoRepository.softDelete(id);
    }
}
