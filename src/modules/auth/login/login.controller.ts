import { Body, Controller, Post } from '@nestjs/common';
import { LoginByMiniProgramCodeBodyDto } from '../dtos/login-by-mini-program-code.body';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginByMiniProgramCodeResponseDto } from '../dtos/login-by-mini-program-code.response';
import { LoginService } from './login.service';

@Controller('auth/login')
@ApiTags('登陆')
export class LoginController {
    constructor(private loginService: LoginService) {}

    @Post('by_mini_program_code')
    @ApiOperation({
        summary: '微信小程序登陆',
        description: '通过微信小程序Code登陆并换领认证TOKEN',
    })
    @ApiCreatedResponse({
        description: '登陆成功',
        type: LoginByMiniProgramCodeResponseDto,
    })
    async byMiniProgramCode(@Body() body: LoginByMiniProgramCodeBodyDto) {
        return await this.loginService.loginByMiniProgramCode(body.code);
    }
}
