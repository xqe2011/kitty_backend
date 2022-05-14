import { Test, TestingModule } from '@nestjs/testing';
import { createMocker } from 'test/utils/create-mocker.function';
import { MockedObject } from 'test/utils/mocked-object';
import { CatVectorType } from '../enums/cat-vector-type.enum';
import { VectorService } from './vector.service';

describe('VectorService', () => {
    let service: VectorService;
    /* 所有依赖返回的值,可以通过这个Mock类方法 */
    let dependencies: { 
        "CatVectorRepository": MockedObject
    };

    beforeEach(async () => {
        /* 定义所有依赖,nest的依赖注入类返回实例所以我们直接注入个object,函数则使用jest.fn */
        dependencies = {
            "CatVectorRepository": {}
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [VectorService]
        })
        .useMocker(createMocker(dependencies))
        .compile();

        service = module.get<VectorService>(VectorService);
    });

    test('should be defined', () => {
        expect(service).toBeDefined();
    });

    test('getVetors()', async () => {
        dependencies["CatVectorRepository"].find = jest.fn().mockResolvedValueOnce([
            {type: CatVectorType.DOCILE, percent: 50},
            {type: CatVectorType.LIVELY, percent: 30},
        ]);
        const data = await service.getVetors(2222);
        expect(dependencies["CatVectorRepository"].find).toBeCalledWith({
            cat: {
                id: 2222,
            },
        });
        expect(data).toEqual({
            [CatVectorType.DOCILE]: 50, 
            [CatVectorType.LIVELY]: 30
        });
    });
});
