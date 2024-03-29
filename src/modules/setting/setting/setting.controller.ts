import { Body, Controller, ParseArrayPipe, Post } from '@nestjs/common';
import { ApiBody, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, } from '@nestjs/swagger';
import { HttpExceptionResponseDto } from 'src/docs/dtos/http-exception.response';
import { FetchSettingBodyDto } from '../dtos/fetch-setting.body';
import { SettingService } from './setting.service';

@Controller('settings')
@ApiTags('配置')
export class SettingController {
    constructor(
        private settingService: SettingService
    ) {}

    @Post('/')
    @ApiOperation({summary: '获取配置' })
    @ApiBody({
        type: FetchSettingBodyDto,
        isArray: true
    })
    @ApiOkResponse({
        description: '获取成功',
        schema: {
            description: '配置键',
            type: 'object',
            additionalProperties: {
                nullable: true,
                description: '配置值,任意类型',
                type: 'string',
            },
        },
    })
    @ApiNotFoundResponse({
        description: '有配置项不存在',
        type: HttpExceptionResponseDto
    })
    async fetchSetting(@Body(new ParseArrayPipe({ items: FetchSettingBodyDto })) body: FetchSettingBodyDto[]) {
        const output = {};
        for (const item of body) {
            output[item.key] = await this.settingService.fetchSettingFromClient(
                item.key,
                item.nullable,
            );
        }
        return output;
    }
}
