import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/modules/user/enums/role.enum';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, } from '@nestjs/swagger';
import { GenerateService } from './generate.service';
import { GetUserImageQueryDto } from '../dtos/get-user-image.query';
import { GetUserImageResponseDto } from '../dtos/get-user-image.response';

@Controller('/qrcode')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
@ApiTags('二维码')
export class GenerateController {
    constructor(private generateService: GenerateService) { }

    @Get('user')
    @Roles(Role.NormalUser, Role.RegisteredUser, Role.Admin)
    @ApiOperation({ summary: '获取用户识别码' })
    @ApiOkResponse({
        description: '获取成功',
        type: GetUserImageResponseDto,
    })
    async getUserImage(@Req() request, @Query() query: GetUserImageQueryDto) {
        return {
            image: await this.generateService.getUserImage(request.user.id, query.size)
        };
    }
}
