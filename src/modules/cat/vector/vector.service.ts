import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatVector } from '../entities/cat-vector.entity';
import { CatVectorType } from '../enums/cat-vector-type.enum';

@Injectable()
export class VectorService {
    constructor(
        @InjectRepository(CatVector)
        private catVectorRepository: Repository<CatVector>,
    ) {}

    /**
     * 获取猫咪向量
     * @param catID 猫咪ID
     * @returns 向量信息
     */
    async getVetors(catID: number) {
        const vectors = await this.catVectorRepository.find({
            cat: {
                id: catID,
            },
        });
        const output = {};
        for (const vector of vectors) {
            output[vector.type] = vector.percent;
        }
        return output as Record<CatVectorType, number>;
    }
}
