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
        expect(await service.generateQRCodeImage("oSKs9edw/YNsfQRQb3qKGGUe", 300)).toEqual("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51AAAAAklEQVR4AewaftIAAAe+SURBVO3B0W1jCQwEwR5C+ac8twkc/fEgSLS7Kv0HSTpgkKQjBkk6YpCkIwZJOmKQpCMGSTpikKQjBkk6YpCkIwZJOmKQpCMGSTpikKQjBkk6YpCkIwZJOmKQpCMGSTpikKQjBkk6YpCkIwZJOmKQpCMGSTpikKQjBkk6YpCkIwZJOmKQpCMGSTpikKQjBkk64sUXSMJv15Z3SsKmLZskbNryVBI2bXkiCZu2vFMSfru2fNIgSUcMknTEIElHDJJ0xCBJRwySdMQgSUe8OKAt3y4JTyRh05ZNWzZJ+HZJ+KQkbNryRFu+XRK+2SBJRwySdMQgSUcMknTEIElHDJJ0xCBJR7z4BZLwTm35tCQ80ZZNEp5Iwk/asknCOyVh05ZPS8I7teWyQZKOGCTpiEGSjhgk6YhBko4YJOmIQZKOeKET2rJJwiYJTyRh05afJOGT2qLbBkk6YpCkIwZJOmKQpCMGSTpikKQjBkk64oVOSMKmLU8kYdOWd2vLJgmbtmySsGmLvtsgSUcMknTEIElHDJJ0xCBJRwySdMQgSUe8+AXa8tclYdOWTVs2Sfi0tmySsGnLJgmbtrxbW/T/Bkk6YpCkIwZJOmKQpCMGSTpikKQjBkk6YpCkI14ckIS/ri2bJDyRhE1bNkn4SVs2Sdi05bIk6JlBko4YJOmIQZKOGCTpiEGSjhgk6YhBko548QXa8te15Ym2PNGWv64tT7RF7zVI0hGDJB0xSNIRgyQdMUjSEYMkHTFI0hEvfoEkbNryRBI+rS2bJGza8kQSNm35SRKeSMInJWHTlk0Svl1bvtkgSUcMknTEIElHDJJ0xCBJRwySdMQgSUe8+AJJ2LRl05ZNEjZteaotmyRs2rJJwqYtTyRh05Z3a8snJeGJJDzVlndKwmWDJB0xSNIRgyQdMUjSEYMkHTFI0hGDJB3x4gu05YkkvFNbfpKEJ5KwacsmCU+0ZZOET0vCO7XliSRs2vJuSdi0ZZOETVs+aZCkIwZJOmKQpCMGSTpikKQjBkk6YpCkI9J/+HJJ2LTl2yVh05ZNEjZt2SThndrykyQ80ZZNEj6pLe+WhE1bNkl4oi2fNEjSEYMkHTFI0hGDJB0xSNIRgyQdMUjSEek/HJeEd2rLT5LwRFt+uyR8s7Y8kYSn2vJEEjZtuWyQpCMGSTpikKQjBkk6YpCkIwZJOmKQpCNe/AFt2SRhk4SftGWThE9Kwju15d3a8k5J2LTl27Vlk4RNW77ZIElHDJJ0xCBJRwySdMQgSUcMknTEIElHpP/wYUn47dqyScKmLZskPNGWTRKeassmCU+0ZZOETVs2SXiiLT9JwqYt75SETVs+aZCkIwZJOmKQpCMGSTpikKQjBkk6YpCkIwZJOiL9hy+XhE1bNknYtOXTkvBEWzZJeKItTyVh05ZNEr5ZW55KwhNteSIJm7Z80iBJRwySdMQgSUcMknTEIElHDJJ0xCBJR7w4oC2bJGza8kQS3q0tTyThibY8kYSftOWd2vJEEjZt2SRh05aftGWThE0SNm25bJCkIwZJOmKQpCMGSTpikKQjBkk6YpCkI178AUl4oi1PJeGJJGza8kQSnmjLT5KwacumLd+sLe/Wlr9skKQjBkk6YpCkIwZJOmKQpCMGSTpikKQjXnyBJHxSWzZJeKotT7TliSRs2vJpSdi0ZZOEJ9ryRBKeassmCZu2/GaDJB0xSNIRgyQdMUjSEYMkHTFI0hGDJB3x4gu05YkkfFpbnkjCJyXhibY81ZZNEjZt2SRhk4RNWzZtua4t32yQpCMGSTpikKQjBkk6YpCkIwZJOmKQpCPSf/iwJDzRlk0SNm15KgmbtlyWhE1bnkqCdm3ZJOGJtnyzQZKOGCTpiEGSjhgk6YhBko4YJOmIQZKOSP9BH5cE7dqyScKmLZskbNrybknYtGWThE1bNknYtOWTBkk6YpCkIwZJOmKQpCMGSTpikKQjBkk64sUXSMJv15Yn2vLbJWGThG+WhE1b3q0tv9kgSUcMknTEIElHDJJ0xCBJRwySdMQgSUe8OKAt3y4Jn5SEJ9ryRBKeassTSfiktrxbEjZt2SThskGSjhgk6YhBko4YJOmIQZKOGCTpiEGSjhgk6YgXv0AS3qkt79aWTRLeKQmbtrxbEp5oyyYJTyTh09rylw2SdMQgSUcMknTEIElHDJJ0xCBJRwySdMQLndCWb9aWnyRh05YnkvBJbdkk4du15ZsNknTEIElHDJJ0xCBJRwySdMQgSUcMknTEC32FJGzasknCpi2bJGzasknCU0l4oi1PJGHTlm+XhCeSsGnLJw2SdMQgSUcMknTEIElHDJJ0xCBJRwySdMSLX6At17Xlr2vLJgmbJGzasmnLE0l4tyRs2vKbDZJ0xCBJRwySdMQgSUcMknTEIElHDJJ0xIsDkvDXJWHTlk0SnkjCpi3v1pZ3SsKmLZu2bJLw7ZKwacsnDZJ0xCBJRwySdMQgSUcMknTEIElHDJJ0RPoPknTAIElHDJJ0xCBJRwySdMQgSUcMknTEIElHDJJ0xCBJRwySdMQgSUcMknTEIElHDJJ0xCBJRwySdMQgSUcMknTEIElHDJJ0xCBJRwySdMQgSUcMknTEIElHDJJ0xCBJRwySdMQgSUcMknTEIElH/AcUbUdiAKjFPwAAAABJRU5ErkJggg==");
    });
});
