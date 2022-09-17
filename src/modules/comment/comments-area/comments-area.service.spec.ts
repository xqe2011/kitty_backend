import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { CommentsArea } from '../entities/comments-area.entity';
import { CommentsAreaService } from './comments-area.service';

describe('CommentsAreaService', () => {
    let service: CommentsAreaService;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "CommentsAreaRepository": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "CommentsAreaRepository": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [CommentsAreaService],
        })
        .useMocker(createMocker(dependencies))
        .compile();

        service = module.get<CommentsAreaService>(CommentsAreaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    test('getAreaInfoByID()', async () => {
        dependencies["CommentsAreaRepository"].findOne = jest.fn().mockResolvedValueOnce({isDisplay: true});
        const data1 = await service.getAreaInfoByID(1111);
        expect(dependencies["CommentsAreaRepository"].findOne).toBeCalledWith({
            where: {
                id: 1111,
            },
            select: ['isDisplay'],
        });
        expect(data1).toEqual({isDisplay: true});
    });

    test('isAreaExists() - Exists', async () => {
        dependencies["CommentsAreaRepository"].count = jest.fn().mockResolvedValueOnce(1);
        const data1 = await service.isAreaExists(1111);
        expect(dependencies["CommentsAreaRepository"].count).toBeCalledWith({ id: 1111 });
        expect(data1).toEqual(true);
    });

    test('isAreaExists() - Not Exists', async () => {
        dependencies["CommentsAreaRepository"].count = jest.fn().mockResolvedValueOnce(0);
        const data1 = await service.isAreaExists(1111);
        expect(dependencies["CommentsAreaRepository"].count).toBeCalledWith({ id: 1111 });
        expect(data1).toEqual(false);
    });

    test('isAreaVisible() - Visible', async () => {
        dependencies["CommentsAreaRepository"].count = jest.fn().mockResolvedValueOnce(1);
        const data1 = await service.isAreaVisible(1111);
        expect(dependencies["CommentsAreaRepository"].count).toBeCalledWith({
            id: 1111,
            isDisplay: true,
        });
        expect(data1).toEqual(true);
    });

    test('isAreaVisible() - Not Visible', async () => {
        dependencies["CommentsAreaRepository"].count = jest.fn().mockResolvedValueOnce(0);
        const data1 = await service.isAreaVisible(1111);
        expect(dependencies["CommentsAreaRepository"].count).toBeCalledWith({
            id: 1111,
            isDisplay: true,
        });
        expect(data1).toEqual(false);
    });

    test('createArea()', async () => {
        const manager = {
            save: jest.fn().mockResolvedValueOnce({id: 1111})
        };
        const data1 = await service.createArea(manager as any);
        const area = new CommentsArea();
        area.isDisplay = true;
        expect(manager.save).toBeCalledWith(area);
        expect(data1).toEqual(1111);
    });

    test('setAreaVisible()', async () => {
        dependencies["CommentsAreaRepository"].update = jest.fn();
        await service.setAreaVisible(1111, true);
        expect(dependencies["CommentsAreaRepository"].update).toBeCalledWith({ id: 1111 }, { isDisplay: true },);
    });

    test('updateAreaInfo()', async () => {
        dependencies["CommentsAreaRepository"].update = jest.fn();
        await service.updateAreaInfo(1, true);
        expect(dependencies["CommentsAreaRepository"].update).toBeCalledWith(
            1,
            {
                isDisplay: true
            }
        );
    });
});
