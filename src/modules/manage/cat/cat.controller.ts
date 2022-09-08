import { Body, Controller, Delete, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/modules/user/enums/role.enum';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, } from '@nestjs/swagger';
import { CatService } from 'src/modules/cat/cat/cat.service';
import { CreateCatBodyDto } from '../dtos/create-cat.body';
import { CreateCatResponseDto } from '../dtos/create-cat.response';
import { UpdateCatResponseDto } from '../dtos/update-cat.response';
import { UpdateCatBodyDto } from '../dtos/update-cat.body';
import { UpdateCatParamDto } from '../dtos/update-cat.param';
import { DeleteCatResponseDto } from '../dtos/delete-cat.response';
import { DeleteCatParamDto } from '../dtos/delete-cat.param';

@Controller('/manage')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.Admin)
@ApiBearerAuth()
@ApiTags('管理')
export class CatController {
    constructor(
        private catService: CatService
    ) { }

    @Post('cats')
    @ApiOperation({
        summary: '创建猫咪',
        description: '创建猫咪,需要管理员权限'
    })
    @ApiOkResponse({
        description: '创建成功',
        type: CreateCatResponseDto
    })
    async createCat(@Body() body: CreateCatBodyDto) {
        return {
            id: await this.catService.createCat(body.name, body.species, body.isNeuter, body.description, body.haunt, body.status)
        };
    }

    @Put('cat/:id')
    @ApiOperation({
        summary: '修改猫咪信息',
        description: '修改猫咪信息,需要管理员权限'
    })
    @ApiOkResponse({
        description: '修改成功',
        type: UpdateCatResponseDto
    })
    async updateCat(@Param() param: UpdateCatParamDto, @Body() body: UpdateCatBodyDto) {
        await this.catService.updateCat(param.id, body.name, body.species, body.isNeuter, body.description, body.haunt, body.status);
        return {};
    }

    @Delete('cat/:id')
    @ApiOperation({
        summary: '删除猫咪',
        description: '删除猫咪,需要管理员权限'
    })
    @ApiOkResponse({
        description: '删除成功',
        type: DeleteCatResponseDto
    })
    async deleteCat(@Param() param: DeleteCatParamDto) {
        await this.catService.deleteCat(param.id);
        return {};
    }
}
