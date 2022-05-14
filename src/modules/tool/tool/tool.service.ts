import { Injectable } from '@nestjs/common';

@Injectable()
export class ToolService {
    /**
     * 获取当前时间戳
     * @returns 时间戳
     */
    getNowTimestamp() {
        return Math.floor(Date.now() / 1000);
    }
}
