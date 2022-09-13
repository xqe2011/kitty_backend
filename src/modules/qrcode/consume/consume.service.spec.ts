import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { ConsumeService } from './consume.service';

describe('ConsumeService', () => {
    let service: ConsumeService;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "QRCodeService": MockedObject,
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "QRCodeService": {},
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [ConsumeService],
        })
        .useMocker(createMocker(dependencies))
        .compile();

        service = module.get<ConsumeService>(ConsumeService);
    });

    test('should be defined', () => {
        expect(service).toBeDefined();
    });

    test('getUserIDByBase64()', async () => {
        dependencies["QRCodeService"].decode = jest.fn().mockResolvedValue({ userID: 1 });
        expect(await service.getUserIDByBase64("oSKs9edw/YNsfQRQb3qKGGUe")).toEqual(1);
        expect(dependencies["QRCodeService"].decode).toBeCalledWith("oSKs9edw/YNsfQRQb3qKGGUe");
    });
});
