import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { QRCodeType } from '../enums/qrcode-type.enum';
import { IsQRCodeValidValidator } from './is-qrcode-valid.validator';

describe('IsQRCodeValidValidator', () => {
    let validator: IsQRCodeValidValidator;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "QRCodeService": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "QRCodeService": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [IsQRCodeValidValidator]
        })
        .useMocker(createMocker(dependencies))
        .compile();

        validator = module.get<IsQRCodeValidValidator>(IsQRCodeValidValidator);
    });

    test('should be defined', () => {
        expect(validator).toBeDefined();
    });
    test('validate() - QRCode is valid', async () => {
        dependencies["QRCodeService"].validate = jest.fn().mockResolvedValueOnce(true);
        const data1 = await validator.validate("2jJE3WvaUQGCG/VtU1l3GdrA", { constraints: [ QRCodeType.USER ] } as any);
        expect(dependencies["QRCodeService"].validate).toBeCalledWith("2jJE3WvaUQGCG/VtU1l3GdrA", [ QRCodeType.USER ]);
        expect(data1).toBe(true);
    });

    test('validate() - QRCode is not string', async () => {
        dependencies["QRCodeService"].validate = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate(123, { constraints: [ QRCodeType.USER ] } as any);
        expect(data1).toBe(false);
    });

    test('validate() - QRCode is not valid.', async () => {
        dependencies["QRCodeService"].validate = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate("2jJE3WvaUQGCG/VtU1l3GdrA", { constraints: [ QRCodeType.USER ] } as any);
        expect(dependencies["QRCodeService"].validate).toBeCalledWith("2jJE3WvaUQGCG/VtU1l3GdrA", [ QRCodeType.USER ]);
        expect(data1).toBe(false);
    });

    test('validate() - QRCode is valid but not allowed type', async () => {
        dependencies["QRCodeService"].validate = jest.fn().mockResolvedValueOnce(false);
        const data1 = await validator.validate("2jJE3WvaUQGCG/VtU1l3GdrA", { constraints: [ ] } as any);
        expect(dependencies["QRCodeService"].validate).toBeCalledWith("2jJE3WvaUQGCG/VtU1l3GdrA", []);
        expect(data1).toBe(false);
    });

    test('defaultMessage()', async () => {
        expect(await validator.defaultMessage({} as any)).toBe('QRCode is not valid or not allowed type!');
    });
});
