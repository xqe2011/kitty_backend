import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/modules/user/enums/role.enum';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { CatService } from './cat.service';
import { GetCatInfoParamDto } from '../dtos/get-cat-info.param';
import { GetCatsQueryDto } from '../dtos/get-cats.query';
import { SearchCatsQueryDto } from '../dtos/search-cats.query';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, } from '@nestjs/swagger';
import { GetCatsResponseDto } from '../dtos/get-cats.response';
import { GetCatInfoResponseDto } from '../dtos/get-cat-info.response';
import { SearchCatsOutputDto } from '../dtos/search-cats.response';

@Controller('cats')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
@ApiTags('猫咪')
export class CatController {
    constructor(private catService: CatService) { }

    @Get('/')
    @Roles(Role.NormalUser, Role.RegisteredUser, Role.Admin)
    @ApiOperation({ summary: '获取猫咪列表' })
    @ApiOkResponse({
        description: '获取成功,返回简略的猫咪列表',
        type: GetCatsResponseDto,
        isArray: true,
    })
    async getCatsList(@Query() query: GetCatsQueryDto) {
        return await this.catService.getCatsListByIDs(undefined, query.limit, query.start);
    }

    @Get('/:id')
    @Roles(Role.NormalUser, Role.RegisteredUser, Role.Admin)
    @ApiOperation({ summary: '获取猫咪详细信息' })
    @ApiOkResponse({
        description: '获取成功',
        type: GetCatInfoResponseDto,
    })
    async getCatInfo(@Param() param: GetCatInfoParamDto) {
        return await this.catService.getCatInfoWithSelectedAndCoverPhotos(param.id);
    }

    @Get('search')
    @Roles(Role.NormalUser, Role.RegisteredUser, Role.Admin)
    @ApiOperation({ summary: '搜索猫咪' })
    @ApiOkResponse({
        description: '搜索成功,返回简略的猫咪列表',
        type: SearchCatsOutputDto,
        isArray: true,
    })
    async searchCat(@Query() query: SearchCatsQueryDto) {
        return await this.catService.searchCatReturnInCatLists(query.keyword, query.limit, query.start);
    }
}
