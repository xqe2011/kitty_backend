import { Body, Controller, ParseArrayPipe, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags, } from '@nestjs/swagger';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { Role } from 'src/modules/user/enums/role.enum';
import { WriteLogBodyDto } from '../dtos/write-log.body';
import { WriteLogResponseDto } from '../dtos/write-log.response';
import { UserLogService } from './user-log.service';

@Controller('logs')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
@ApiTags('日记')
export class UserLogController {
    constructor(private userLogService: UserLogService) {}

    @Post('/')
    @Roles(Role.Admin, Role.NormalUser, Role.RegisteredUser)
    @ApiOperation({ summary: '批量写入操作日记' })
    @ApiOkResponse({
        description: '写入成功',
        type: WriteLogResponseDto,
    })
    @ApiBody({
        type: WriteLogBodyDto,
        isArray: true,
    })
    async writeLogs(@Req() request, @Body(new ParseArrayPipe({ items: WriteLogBodyDto })) body: WriteLogBodyDto[]) {
        for (const item of body) {
            /** Magic */
            const message = item['message' + item.type];
            await this.userLogService.writeLog(request.user.id, item.type, message, item.date);
        }
        return {};
    }
}
