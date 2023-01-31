import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/modules/user/enums/role.enum';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, } from '@nestjs/swagger';
import { ManageLogService } from '../manage-log/manage-log.service';
import { ManageLogType } from '../enums/manage-log-type.enum';
import { ShopService } from 'src/modules/shop/shop/shop.service';
import { CreateItemBodyDto } from '../dtos/create-item.body';
import { CreateItemResponseDto } from '../dtos/create-item.response';
import { DeleteItemResponseDto } from '../dtos/delete-item.response';
import { DeleteItemParamDto } from '../dtos/delete-item.param';
import { AddPhotoToItemResponseDto } from '../dtos/add-photo-to-item.response';
import { AddPhotoToItemBodyDto } from '../dtos/add-photo-to-item.body';
import { AddPhotoToItemParamDto } from '../dtos/add-photo-to-item.param';
import { DeletePhotoParamDto } from '../dtos/delete-photo.param';
import { GetShopItemsQueryDto } from '../dtos/get-shop-items.query';
import { GetShopItemsResponseDto } from '../dtos/get-shop-items.response';
import { DeletePhotoResponseDto } from '../dtos/delete-photo.response';

@Controller('/manage')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.Admin)
@ApiBearerAuth()
@ApiTags('管理')
export class ShopItemController {
    constructor(
        private shopService: ShopService,
        private manageLogService: ManageLogService
    ) { }

    @Get('shop/items')
    @ApiOperation({
        summary: '获取所有商品列表',
        description: '创建商品,需要管理员权限'
    })
    @ApiOkResponse({
        description: '创建成功',
        type: GetShopItemsResponseDto,
        isArray: true
    })
    async getItems(@Query() query: GetShopItemsQueryDto) {
        return await this.shopService.getItemsList(false, query.limit, query.start);
    }

    @Post('shop/items')
    @ApiOperation({
        summary: '创建商品',
        description: '创建商品,需要管理员权限'
    })
    @ApiOkResponse({
        description: '创建成功',
        type: CreateItemResponseDto
    })
    async createItem(@Req() request, @Body() body: CreateItemBodyDto) {
        const data = { id: await this.shopService.createItem(body.name, body.description, body.price, body.visible) };
        await this.manageLogService.writeLog(request.user.id, ManageLogType.CREATE_SHOP_ITEM, { ...body, ...data });
        return data;
    }

    @Delete('shop/item/:id')
    @ApiOperation({
        summary: '删除商品',
        description: '删除商品,需要管理员权限'
    })
    @ApiOkResponse({
        description: '删除成功',
        type: DeleteItemResponseDto
    })
    async deleteItem(@Req() request, @Param() param: DeleteItemParamDto) {
        await this.shopService.deleteItem(param.id);
        await this.manageLogService.writeLog(request.user.id, ManageLogType.DELETE_SHOP_ITEM, { ...param });
        return {};
    }

    @Post('shop/item/:id/photos')
    @ApiOperation({
        summary: '添加照片到商品',
        description: '添加照片到商品,需要管理员权限'
    })
    @ApiOkResponse({
        description: '添加成功',
        type: AddPhotoToItemResponseDto
    })
    async addPhotoToItem(@Req() request, @Param() param: AddPhotoToItemParamDto, @Body() body: AddPhotoToItemBodyDto) {
        const data = { id: await this.shopService.addPhotoToItem(param.id, body.fileToken) };
        await this.manageLogService.writeLog(request.user.id, ManageLogType.ADD_PHOTO_TO_SHOP_ITEM, { ...param, ...body, ...data });
        return data;
    }

    @Put('shop/photo/:id')
    @ApiOperation({
        summary: '修改商品照片信息',
        description: '修改商品照片信息,需要管理员权限'
    })
    @ApiOkResponse({
        description: '修改成功',
        type: DeletePhotoResponseDto
    })
    async updatePhoto(@Req() request, @Param() param: DeletePhotoParamDto) {
        await this.shopService.deletePhoto(param.id);
        await this.manageLogService.writeLog(request.user.id, ManageLogType.DELETE_SHOP_PHOTO, { ...param });
        return {};
    }

    @Delete('shop/photo/:id')
    @ApiOperation({
        summary: '删除商品照片',
        description: '删除商品照片,需要管理员权限'
    })
    @ApiOkResponse({
        description: '删除成功',
        type: DeletePhotoResponseDto
    })
    async deletePhoto(@Req() request, @Param() param: DeletePhotoParamDto) {
        await this.shopService.deletePhoto(param.id);
        await this.manageLogService.writeLog(request.user.id, ManageLogType.DELETE_SHOP_PHOTO, { ...param });
        return {};
    }

}
