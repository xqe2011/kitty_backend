import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { Setting } from '../entities/setting.entity';
import { SettingService } from './setting.service';

describe('SettingService', () => {
    let service: SettingService;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "SettingRepository": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "SettingRepository": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [SettingService],
        })
        .useMocker(createMocker(dependencies))
        .compile();

        service = module.get<SettingService>(SettingService);
    });

    test("fetchSettingFromClient() - Exists", async () => {
        dependencies["SettingRepository"].findOne = jest.fn().mockResolvedValueOnce({value: [10]});
        const data1 = await service.fetchSettingFromClient("anc", false);
        expect(dependencies["SettingRepository"].findOne).toBeCalledWith({
            where: {
                key: "anc",
                canClientFetch: true,
            },
            select: ['value'],
        });
        expect(data1).toEqual(10);
    });

    test("fetchSettingFromClient() - Not Exists And Nullable", async () => {
        dependencies["SettingRepository"].findOne = jest.fn().mockResolvedValueOnce(undefined);
        const data1 = await service.fetchSettingFromClient("anc", true);
        expect(dependencies["SettingRepository"].findOne).toBeCalledWith({
            where: {
                key: "anc",
                canClientFetch: true,
            },
            select: ['value'],
        });
        expect(data1).toEqual(null);
    });

    test("fetchSettingFromClient() - Not Exists And Not Nullable", async () => {
        dependencies["SettingRepository"].findOne = jest.fn().mockResolvedValueOnce(undefined);
        try {
            await service.fetchSettingFromClient("anc", false);
        } catch(e) {
            expect(e).toBeInstanceOf(NotFoundException);
        }
        expect(dependencies["SettingRepository"].findOne).toBeCalledWith({
            where: {
                key: "anc",
                canClientFetch: true,
            },
            select: ['value'],
        });
    });

    test("getSetting() - Exists", async () => {
        dependencies["SettingRepository"].findOne = jest.fn().mockResolvedValueOnce({value: [10]});
        const data1 = await service.getSetting("anc");
        expect(dependencies["SettingRepository"].findOne).toBeCalledWith({
            where: {
                key: "anc",
            },
            select: ['value'],
        });
        expect(data1).toEqual(10);
    });

    test("getSetting() - Not Exists", async () => {
        dependencies["SettingRepository"].findOne = jest.fn().mockResolvedValueOnce(undefined);
        const data1 = await service.getSetting("anc");
        expect(dependencies["SettingRepository"].findOne).toBeCalledWith({
            where: {
                key: "anc",
            },
            select: ['value'],
        });
        expect(data1).toEqual('');
    });

    test("getAndLockSetting() - Exists", async () => {
        const getRepository = {
            findOne: jest.fn().mockResolvedValue({value: [10]})
        };
        const manager = {
            getRepository: jest.fn().mockReturnValue(getRepository)
        };
        const data1 = await service.getAndLockSetting("anc", manager as any);
        expect(manager.getRepository).toBeCalledWith(Setting);
        expect(getRepository.findOne).toBeCalledWith({
            where: {
                key: "anc",
            },
            select: ['value'],
            lock: {
                mode: 'pessimistic_write',
            },
        });
        expect(data1).toEqual(10);
    });

    test("getAndLockSetting() - Not Exists", async () => {
        const getRepository = {
            findOne: jest.fn().mockResolvedValue(undefined)
        };
        const manager = {
            getRepository: jest.fn().mockReturnValue(getRepository)
        };
        const data1 = await service.getAndLockSetting("anc", manager as any);
        expect(manager.getRepository).toBeCalledWith(Setting);
        expect(getRepository.findOne).toBeCalledWith({
            where: {
                key: "anc",
            },
            select: ['value'],
            lock: {
                mode: 'pessimistic_write',
            },
        });
        expect(data1).toEqual('');
    });

    test("updateSetting() - Transaction", async () => {
        const getRepository = {
            update: jest.fn()
        };
        const manager = {
            getRepository: jest.fn().mockReturnValue(getRepository)
        };
        await service.updateSetting("anc", "cna", manager as any);
        expect(manager.getRepository).toBeCalledWith(Setting);
        expect(getRepository.update).toBeCalledWith({ key: "anc" }, { value: ["cna"] });
    });

    test("updateSetting() - Not Transaction", async () => {
        dependencies["SettingRepository"].update = jest.fn();
        await service.updateSetting("anc", "cna");
        expect(dependencies["SettingRepository"].update).toBeCalledWith({ key: "anc" }, { value: ["cna"] });
    });

    test("createSetting() - Transaction", async () => {
        const getRepository = {
            save: jest.fn()
        };
        const manager = {
            getRepository: jest.fn().mockReturnValue(getRepository)
        };
        await service.createSetting("anc", "cna", false, manager as any);
        expect(manager.getRepository).toBeCalledWith(Setting);
        expect(getRepository.save).toBeCalledWith({
            key: "anc",
            value: ["cna"],
            canClientFetch: false,
        });
    });

    test("createSetting() - Without Transaction", async () => {
        dependencies["SettingRepository"].save = jest.fn();
        await service.createSetting("anc", "cna", false);
        expect(dependencies["SettingRepository"].save).toBeCalledWith({
            key: "anc",
            value: ["cna"],
            canClientFetch: false,
        });
    });
});
