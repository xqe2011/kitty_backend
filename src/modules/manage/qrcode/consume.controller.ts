import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/modules/user/enums/role.enum';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, } from '@nestjs/swagger';
import { ConsumeService } from 'src/modules/qrcode/consume/consume.service';
import { ConsumeUserCodeResponseDto } from '../dtos/consume-user-code.response';
import { ConsumeUserCodeQueryDto } from '../dtos/consume-user-code.query';

@Controller('/manage')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.Admin)
@ApiBearerAuth()
@ApiTags('管理')
export class ConsumeController {
    constructor(
        private consumeService: ConsumeService
    ) { }

    @Get('qrcode/consume/user')
    @ApiOperation({
        summary: '获取用户识别码信息',
        description: '获取用户识别码信息,需要管理员权限'
    })
    @ApiOkResponse({
        description: '获取成功',
        type: ConsumeUserCodeResponseDto
    })
    async consumeUserCode(@Query() query: ConsumeUserCodeQueryDto) {
        return {
            userID: await this.consumeService.getUserIDByBase64(query.code)
        };
    }
}
