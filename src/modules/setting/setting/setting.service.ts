import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Setting } from '../entities/setting.entity';

@Injectable()
export class SettingService {
    constructor(
        @InjectRepository(Setting)
        private settingRepository: Repository<Setting>,
    ) {}

    /**
     * 客户端请求获取配置
     * @param key 键
     * @param nullable 是否允许不存在返回空指
     * @returns 值
     */
    async fetchSettingFromClient(key: string, nullable = false) {
        const val = await this.settingRepository.findOne({
            where: {
                key: key,
                canClientFetch: true,
            },
            select: ['value'],
        });
        if (val === undefined) {
            if (nullable) {
                return null;
            }
            throw new NotFoundException('Cannot find this setting');
        }
        /** 为了能够支持存储stirng,number这种纯类型,我们将原始数据包装一下 */
        return val.value[0];
    }

    /**
     * 获取配置
     * @param key 键
     * @returns 值
     */
    async getSetting(key: string) {
        const val = await this.settingRepository.findOne({
            where: {
                key: key,
            },
            select: ['value'],
        });
        /** 为了能够支持存储stirng,number这种纯类型,我们将原始数据包装一下 */
        return val === undefined ? '' : val.value[0];
    }

    /**
     * 排他锁获取配置
     * @param key 键
     * @param manager 事务
     * @returns 值
     */
    async getAndLockSetting(key: string, manager: EntityManager) {
        const settingRepository = manager.getRepository(Setting);
        const val = await settingRepository.findOne({
            where: {
                key: key,
            },
            select: ['value'],
            lock: {
                mode: 'pessimistic_write',
            },
        });
        /** 为了能够支持存储stirng,number这种纯类型,我们将原始数据包装一下 */
        return val === undefined ? '' : val.value[0];
    }

    /**
     * 更新配置
     * @param key 键
     * @param manager 事务,不传入则不使用事务写
     * @returns 值
     */
    async updateSetting(key: string, value: any, manager?: EntityManager) {
        let settingRepository: Repository<Setting>;
        if (manager != undefined) {
            settingRepository = manager.getRepository(Setting);
        } else {
            settingRepository = this.settingRepository;
        }
        await settingRepository.update({ key: key }, { value: [value] });
    }

    /**
     * 创建配置
     * @param key 键
     * @param value 值
     * @param canClientFetch 是否能被客户端获得
     * @param manager 事务,不传入则不使用事务写
     * @returns 值
     */
    async createSetting(
        key: string,
        value: any,
        canClientFetch: boolean,
        manager?: EntityManager,
    ) {
        let settingRepository: Repository<Setting>;
        if (manager != undefined) {
            settingRepository = manager.getRepository(Setting);
        } else {
            settingRepository = this.settingRepository;
        }
        await settingRepository.save({
            key: key,
            value: [value],
            canClientFetch: canClientFetch,
        });
    }
}
