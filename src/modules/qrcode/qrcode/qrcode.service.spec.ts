import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { QRCodeType } from '../enums/qrcode-type.enum';
import { QRCodeService } from './qrcode.service';

describe('QRCodeService', () => {
    let service: QRCodeService;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "ConfigService": MockedObject,
        "ToolService": MockedObject,
        "CryptoService": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "ConfigService": {},
            "ToolService": {},
            "CryptoService": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [QRCodeService],
        })
        .useMocker(createMocker(dependencies))
        .compile();

        service = module.get<QRCodeService>(QRCodeService);
    });

    test('should be defined', () => {
        expect(service).toBeDefined();
    });

    test('validate() - Not valid Base64', async () => {
        expect(await service.validate("1234567781321423", [ QRCodeType.USER ])).toEqual(false);
    });

    test('validate() - Not valid AES String', async () => {
        const key = Buffer.from([0xA1, 0x13, 0xfb, 0xbf, 0xd5, 0x82, 0xb3, 0x51, 0xe5, 0xe2, 0x78, 0x31, 0xfc, 0x78, 0x74, 0x47]);
        dependencies["CryptoService"].derivatKey = jest.fn().mockResolvedValueOnce(key);
        dependencies["CryptoService"].aesEcbDecrypt = jest.fn().mockRejectedValueOnce('test')
        dependencies["ToolService"].getNowTimestamp = jest.fn().mockReturnValueOnce(1);
        expect(await service.validate("oSKs9edw/YNsfQRQb3qKGGUe", [ QRCodeType.USER ])).toEqual(false);
        expect(dependencies["CryptoService"].aesEcbDecrypt).toBeCalledWith(
            key,
            Buffer.from([0x22, 0xac, 0xf5, 0xe7, 0x70, 0xfd, 0x83, 0x6c, 0x7d, 0x04, 0x50, 0x6f, 0x7a, 0x8a, 0x18, 0x65]
        ));
    });

    test('validate() - Timeout', async () => {
        const key = Buffer.from([0xA1, 0x13, 0xfb, 0xbf, 0xd5, 0x82, 0xb3, 0x51, 0xe5, 0xe2, 0x78, 0x31, 0xfc, 0x78, 0x74, 0x47]);
        dependencies["CryptoService"].derivatKey = jest.fn().mockResolvedValueOnce(key);
        dependencies["CryptoService"].aesEcbDecrypt = jest.fn().mockResolvedValueOnce(Buffer.from([0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x63, 0x20, 0x5f, 0x58, 0x63, 0x20, 0x5f, 0x58]));
        dependencies["ConfigService"].get = jest.fn().mockResolvedValueOnce('30');
        dependencies["ToolService"].getNowTimestamp = jest.fn().mockReturnValueOnce(1663065904);
        expect(await service.validate("oSKs9edw/YNsfQRQb3qKGGUe", [ QRCodeType.USER ])).toEqual(false);
    });

    test('validate() - Valid but not allowed type', async () => {
        const key = Buffer.from([0xA1, 0x13, 0xfb, 0xbf, 0xd5, 0x82, 0xb3, 0x51, 0xe5, 0xe2, 0x78, 0x31, 0xfc, 0x78, 0x74, 0x47]);
        dependencies["CryptoService"].derivatKey = jest.fn().mockResolvedValueOnce(key);
        dependencies["CryptoService"].aesEcbDecrypt = jest.fn().mockResolvedValueOnce(Buffer.from([0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x63, 0x20, 0x5f, 0x58, 0x63, 0x20, 0x5f, 0x58]));
        dependencies["ConfigService"].get = jest.fn().mockReturnValueOnce('60');
        dependencies["ToolService"].getNowTimestamp = jest.fn().mockReturnValueOnce(1663065904);
        expect(await service.validate("oSKs9edw/YNsfQRQb3qKGGUe", [ ])).toEqual(false);
    });

    test('validate() - Valid', async () => {
        const key = Buffer.from([0xA1, 0x13, 0xfb, 0xbf, 0xd5, 0x82, 0xb3, 0x51, 0xe5, 0xe2, 0x78, 0x31, 0xfc, 0x78, 0x74, 0x47]);
        dependencies["CryptoService"].derivatKey = jest.fn().mockResolvedValueOnce(key);
        dependencies["CryptoService"].aesEcbDecrypt = jest.fn().mockResolvedValueOnce(Buffer.from([0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x63, 0x20, 0x5f, 0x58, 0x63, 0x20, 0x5f, 0x58]));
        dependencies["ConfigService"].get = jest.fn().mockReturnValueOnce('60');
        dependencies["ToolService"].getNowTimestamp = jest.fn().mockReturnValueOnce(1663065904);
        expect(await service.validate("oSKs9edw/YNsfQRQb3qKGGUe", [ QRCodeType.USER ])).toEqual(true);
    });

    test('decode()', async () => {
        const key = Buffer.from([0xA1, 0x13, 0xfb, 0xbf, 0xd5, 0x82, 0xb3, 0x51, 0xe5, 0xe2, 0x78, 0x31, 0xfc, 0x78, 0x74, 0x47]);
        dependencies["CryptoService"].derivatKey = jest.fn().mockResolvedValueOnce(key);
        dependencies["CryptoService"].aesEcbDecrypt = jest.fn().mockResolvedValueOnce(Buffer.from([0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x63, 0x20, 0x5f, 0x58, 0x63, 0x20, 0x5f, 0x58]));
        expect(await service.decode("oSKs9edw/YNsfQRQb3qKGGUe")).toEqual({ type: '0', userID: 1, otherID: null });
    });

    test('encode()', async () => {
        const key = Buffer.from([0xA1, 0x13, 0xfb, 0xbf, 0xd5, 0x82, 0xb3, 0x51, 0xe5, 0xe2, 0x78, 0x31, 0xfc, 0x78, 0x74, 0x47]);
        dependencies["CryptoService"].derivatKey = jest.fn().mockResolvedValueOnce(key);
        dependencies["CryptoService"].aesEcbEncryptReturnInArray = jest.fn().mockResolvedValueOnce(Buffer.from([0x22, 0xac, 0xf5, 0xe7, 0x70, 0xfd, 0x83, 0x6c, 0x7d, 0x04, 0x50, 0x6f, 0x7a, 0x8a, 0x18, 0x65]));
        dependencies["ToolService"].getNowTimestamp = jest.fn().mockResolvedValueOnce(1663065944);
        expect(await service.encode(QRCodeType.USER, 1, null)).toEqual("oSKs9edw/YNsfQRQb3qKGGUe");
    });

    test('generateQRCodeImage()', async () => {
        expect(await service.generateQRCodeImage("oSKs9edw/YNsfQRQb3qKGGUe", 300, "#000000", "#ffffff")).toEqual("data:image/png;base64,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");
    });
});
