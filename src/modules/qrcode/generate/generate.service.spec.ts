import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { GenerateService } from './generate.service';

describe('GenerateService', () => {
    let service: GenerateService;
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
            providers: [GenerateService],
        })
        .useMocker(createMocker(dependencies))
        .compile();

        service = module.get<GenerateService>(GenerateService);
    });

    test('should be defined', () => {
        expect(service).toBeDefined();
    });

    test('getUserImage()', async () => {
        dependencies["QRCodeService"].generateQRCodeImage = jest.fn().mockResolvedValueOnce("data:image/png");
        dependencies["QRCodeService"].encode = jest.fn().mockResolvedValueOnce("oSKs9edw/YNsfQRQb3qKGGUe");
        expect(await service.getUserImage(1, 300)).toEqual("data:image/png");
    });
});
