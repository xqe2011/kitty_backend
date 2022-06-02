import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Cat } from '../entities/cat.entity';
import { CatPhotoType } from '../enums/cat-photo-type.enum';
import { PhotoService } from '../photo/photo.service';
import { VectorService } from '../vector/vector.service';

@Injectable()
export class CatService {
    constructor(
        @InjectRepository(Cat)
        private catRepository: Repository<Cat>,
        private vectorService: VectorService,
        private photoService: PhotoService
    ) {}

    /**
     * 通过关键词搜索猫咪并返回猫咪简略信息
     * @param keyword 关键字
     * @param limit 限制数量
     * @param start 开始位置
     * @returns 猫咪信息
     */
    async searchCatReturnInCatLists(keyword: string, limit: number, start: number) {
        return await this.getCatsListByIDs(await this.searchCatByKeyword(keyword), limit, start);
    }

    /**
     * 通过关键词搜索猫咪
     * @param keyword 关键字
     * @returns 搜索结果,猫咪ID数组
     */
    async searchCatByKeyword(keyword: string) {
        const cats = await this.catRepository.find({
            where: [
                { name: Like('%' + keyword + '%') },
                { species: Like('%' + keyword + '%') },
                { description: Like('%' + keyword + '%') },
                { haunt: Like('%' + keyword + '%') },
                {
                    isNeuter:
                        keyword === '已绝育'
                            ? true
                            : keyword === '未绝育'
                            ? false
                            : undefined,
                },
            ],
            select: ['id'],
        });
        return cats.map((val) => val.id);
    }

    /**
     * 通过猫咪ID数组获取猫咪列表
     * @param ids 猫咪ID数组,若为undefined则不使用ID作为筛选和排序条件
     * @param limit 限制数量
     * @param start 开始位置
     * @returns 猫咪信息
     */
    async getCatsListByIDs(ids: number[], limit: number, start: number) {
        /* 检查ids是否合法 */
        if (ids === null || (typeof(ids) != "object" && typeof(ids) != "undefined") || (typeof(ids) == "object" && ids.length == 0)) return [];
        const queryBuildinger = this.catRepository.createQueryBuilder('cats');
        queryBuildinger.innerJoin('cats.photos', 'photo');
        queryBuildinger.andWhere("photo.type = :type", { type: CatPhotoType.COVER });
        queryBuildinger.select([
            'cats.id as id',
            'cats.name as name',
            'cats.description as description',
            'cats.haunt as haunt',
            'photo.fileName as coverFileName',
        ]);
        if (ids != undefined) {
            const selectIDs = ids.slice(start, start + limit);
            if (selectIDs.length == 0) return [];
            queryBuildinger.andWhereInIds(selectIDs);
            queryBuildinger.orderBy('FIELD(cats.id, :ids)');
            queryBuildinger.setParameter('ids', selectIDs);
        } else {
            queryBuildinger.orderBy('cats.id');
            queryBuildinger.limit(limit);
            queryBuildinger.offset(start);
        }
        const data = await queryBuildinger.getRawMany();
        return data as {
            id: number;
            name: string;
            haunt: string,
            description: string;
            coverFileName: string;
        }[];
    }

    /**
     * 通过猫咪ID获取猫咪信息和精选/封面照片
     * @param id 猫咪ID
     * @returns 猫咪信息和精选封面照片集合
     */
    async getCatInfoWithSelectedAndCoverPhotos(id: number) {
        return {
            info: await this.getCatInfoByID(id),
            vectors: await this.vectorService.getVetors(id),
            selectedPhotos: await this.photoService.getPhotosByCatIDAndType(id, CatPhotoType.SELECTED, 30, 0),
            coverPhoto: (await this.photoService.getPhotosByCatIDAndType(id, CatPhotoType.COVER, 1, 0))[0],
        };
    }

    /**
     * 检查猫咪存在
     * @param id 猫咪ID
     * @returns 是否存在
     */
    async isCatExists(id: number) {
        return (
            (await this.catRepository.count({
                where: {
                    id: id,
                },
            })) > 0
        );
    }

    /**
     * 通过猫咪ID获取猫咪信息
     * @param id 猫咪ID
     * @returns 猫咪信息
     */
    async getCatInfoByID(id: number) {
        return await this.catRepository.findOne({
            where: {
                id: id
            },
            select: ['status', 'name', 'isNeuter', 'description', 'haunt', 'species']
        });
    }
}
