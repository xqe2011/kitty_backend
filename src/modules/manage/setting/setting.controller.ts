import { Body, Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/modules/user/enums/role.enum';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetSettingsResponseDto } from '../dtos/get-settings.response';
import { GetSettingsQueryDto } from '../dtos/get-settings.query';
import { SettingService } from 'src/modules/setting/setting/setting.service';
import { UpdateSettingResponseDto } from '../dtos/update-setting.response';
import { UpdateSettingParamDto } from '../dtos/update-setting.param';
import { UpdateSettingBodyDto } from '../dtos/update-setting.body';

@Controller('/manage')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.Admin)
@ApiBearerAuth()
@ApiTags('管理')
export class SettingController {
    constructor(
        private settingService: SettingService
    ) { }

    @Get('settings')
    @ApiOperation({
        summary: '获取所有配置',
        description: '获取所有配置,不包含客户端不能获取的配置,需要管理员权限'
    })
    @ApiOkResponse({
        description: '获取成功',
        type: GetSettingsResponseDto,
        isArray: true
    })
    async getSettings(@Query() query: GetSettingsQueryDto) {
        return await this.settingService.getSettingsFromClient(query.limit, query.start);
    }

    @Put('setting/:key')
    @ApiOperation({
        summary: '更新配置',
        description: '更新配置,需要管理员权限'
    })
    @ApiOkResponse({
        description: '更新成功',
        type: UpdateSettingResponseDto
    })
    async updateSetting(@Param() param: UpdateSettingParamDto, @Body() body: UpdateSettingBodyDto) {
        await this.settingService.updateSetting(param.key, body.value);
        return {};
    }
}
