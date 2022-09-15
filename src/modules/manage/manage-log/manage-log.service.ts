import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ManageLog } from '../entities/manage-log.entity';
import { ManageLogType } from '../enums/manage-log-type.enum';

@Injectable()
export class ManageLogService {
    constructor(
        @InjectRepository(ManageLog)
        private manageLogRepository: Repository<ManageLog>,
    ) {}

    /**
     * 写入管理员操作日记
     * @param userID 用户ID
     * @param type 日记类型
     * @param message 日记附加信息
     * @param date 日记时间
     */
    async writeLog(userID: number, type: ManageLogType, message: any) {
        await this.manageLogRepository.insert({
            userID,
            message,
            type
        });
    }
}
