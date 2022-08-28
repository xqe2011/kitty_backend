import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/modules/user/enums/role.enum';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, } from '@nestjs/swagger';
import { ShopService } from './shop.service';
import { GetItemsResponseDto } from '../dtos/get-items.response';
import { GetItemsQueryDto } from '../dtos/get-items.query';

@Controller('/shop')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
@ApiTags('商店')
export class ShopController {
    constructor(private shopService: ShopService) { }

    @Get('/items')
    @Roles(Role.NormalUser, Role.RegisteredUser, Role.Admin)
    @ApiOperation({ summary: '获取商品列表' })
    @ApiOkResponse({
        description: '获取成功,返回的商品列表',
        type: GetItemsResponseDto,
        isArray: true,
    })
    async getItemsList(@Query() query: GetItemsQueryDto) {
        return await this.shopService.getItemsList(query.limit, query.start);
    }
}
