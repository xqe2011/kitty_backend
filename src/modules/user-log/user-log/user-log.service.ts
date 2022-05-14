import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLog } from '../entities/user-log.entity';
import { UserLogType } from '../enums/user-log-type.enum';

@Injectable()
export class UserLogService {
    constructor(
        @InjectRepository(UserLog)
        private userLogRepository: Repository<UserLog>,
    ) {}

    /**
     * 写入操作日记
     * @param userID 用户ID
     * @param type 日记类型
     * @param message 日记附加信息
     * @param date 日记时间
     */
    async writeLog(userID: number, type: UserLogType, message: any, date: Date) {
        await this.userLogRepository.insert({
            user: {
                id: userID,
            },
            message: message,
            type: type,
            createdDate: date,
        });
    }
}
