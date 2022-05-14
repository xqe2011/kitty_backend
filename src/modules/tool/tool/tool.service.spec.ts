import { Test, TestingModule } from '@nestjs/testing';
import { ToolService } from './tool.service';

describe('ToolService', () => {
    let service: ToolService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ToolService],
        }).compile();

        service = module.get<ToolService>(ToolService);
    });

    test('should be defined', () => {
        expect(service).toBeDefined();
    });

    test('getNowTimestamp()', () => {
        const date = jest.spyOn(Date, "now");
        const floor = jest.spyOn(Math, "floor");
        date.mockReturnValue(1651598296247);
        floor.mockReturnValue(1651598296);
        const data1 = service.getNowTimestamp();
        expect(date).toBeCalledWith();
        expect(floor).toBeCalledWith(1651598296247 / 1000);
        expect(data1).toEqual(1651598296);
    });
});
