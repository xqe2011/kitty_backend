import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/modules/user/enums/role.enum';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, } from '@nestjs/swagger';
import { OrderService } from 'src/modules/shop/order/order.service';
import { UpdateOrderResponseDto } from '../dtos/update-order.response';
import { UpdateOrderParamDto } from '../dtos/update-order.param';
import { UpdateOrderBodyDto } from '../dtos/update-order.body'
import { SearchOrdersQueryDto } from '../dtos/search-orders.query';
import { SearchOrdersResponseDto } from '../dtos/search-orders.response';
import { CancelOrderParamDto } from '../dtos/cancel-order.param';
import { CancelOrderBodyDto } from '../dtos/cancel-order.body';
import { CancelOrderResponseDto } from '../dtos/cancel-order.response';
import { OrderStatusType } from 'src/modules/shop/enums/order-status-type.enum';
import { ManageLogService } from '../manage-log/manage-log.service';
import { ManageLogType } from '../enums/manage-log-type.enum';

@Controller('/manage')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.Admin, Role.RegisteredUser)
@ApiBearerAuth()
@ApiTags('管理')
export class ShopOrderController {
    constructor(
        private orderService: OrderService,
        private manageLogService: ManageLogService
    ) { }

    @Get('shop/orders')
    @ApiOperation({
        summary: '搜索订单',
        description: '搜索照片,需要管理员权限'
    })
    @ApiOkResponse({
        description: '搜索成功',
        type: SearchOrdersResponseDto,
        isArray: true
    })
    async searchOrders(@Query() query: SearchOrdersQueryDto) {
        return await this.orderService.searchOrders(query.status, query.userID, query.limit, query.start);
    }

    @Put('shop/order/:id')
    @ApiOperation({
        summary: '修改订单信息',
        description: '修改订单信息,注意取消订单需要使用专用接口,需要管理员权限'
    })
    @ApiOkResponse({
        description: '修改成功',
        type: UpdateOrderResponseDto
    })
    async updateOrder(@Req() request, @Param() param: UpdateOrderParamDto, @Body() body: UpdateOrderBodyDto) {
        await this.orderService.updateOrderInfo(param.id, body.status as unknown as OrderStatusType);
        await this.manageLogService.writeLog(request.user.id, ManageLogType.UPDATE_ORDER, { ...param, ...body });
        return {};
    }

    @Post('shop/order/:id/cancel')
    @ApiOperation({
        summary: '取消订单',
        description: '取消订单,需要管理员权限'
    })
    @ApiOkResponse({
        description: '取消成功',
        type: CancelOrderResponseDto
    })
    async cancelOrder(@Req() request, @Param() param: CancelOrderParamDto, @Body() body: CancelOrderBodyDto) {
        await this.orderService.cancelOrder(param.id, false, body.reason);
        await this.manageLogService.writeLog(request.user.id, ManageLogType.CANCEL_ORDER, { ...param, ...body });
        return {};
    }

}
