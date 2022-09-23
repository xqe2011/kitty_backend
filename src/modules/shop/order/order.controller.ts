import { Body, Controller, ForbiddenException, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/modules/user/enums/role.enum';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnprocessableEntityResponse, } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { GetOrdersQueryDto } from '../dtos/get-orders.query';
import { GetOrdersResponseDto } from '../dtos/get-orders.response';
import { CreateOrderResponseDto } from '../dtos/create-order.response';
import { CreateOrderBodyDto } from '../dtos/create-order.body';
import { ApiExceptionResponseDto } from 'src/docs/dtos/api-exception.response';
import { CancelOrderParamDto } from '../dtos/cancel-order.param';
import { CancelOrderResponseDto } from '../dtos/cancel-order.response';

@Controller('/shop')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
@ApiTags('商店')
export class OrderController {
    constructor(
        private orderService: OrderService
    ) { }

    @Get('/orders')
    @Roles(Role.RegisteredUser, Role.Admin)
    @ApiOperation({
        summary: '获取订单列表',
        description: '获取属于用户的订单列表,需要注册用户权限'
    })
    @ApiOkResponse({
        description: '获取成功,返回的商品列表',
        type: GetOrdersResponseDto,
        isArray: true,
    })
    async getOrdersList(@Req() request, @Query() query: GetOrdersQueryDto) {
        return await this.orderService.searchOrders(undefined, request.user.id, query.limit, query.start);
    }

    @Post('/orders')
    @Roles(Role.RegisteredUser, Role.Admin)
    @ApiOperation({
        summary: '创建订单',
        description: '创建订单并发起购买,需要注册用户权限'
    })
    @ApiOkResponse({
        description: '购买成功',
        type: CreateOrderResponseDto
    })
    @ApiUnprocessableEntityResponse({
        description: "业务错误,请查阅业务错误代码列表",
        type: ApiExceptionResponseDto
    })
    async createOrder(@Req() request, @Body() body: CreateOrderBodyDto) {
        return {
            orderID: await this.orderService.createOrder(request.user.id, body.itemID, body.quantity)
        };
    }

    @Post('/order/:id/cancel')
    @Roles(Role.RegisteredUser, Role.Admin)
    @ApiOperation({
        summary: '取消订单',
        description: '取消订单,需要注册用户权限'
    })
    @ApiOkResponse({
        description: '取消成功',
        type: CancelOrderResponseDto
    })
    @ApiUnprocessableEntityResponse({
        description: "业务错误,请查阅业务错误代码列表",
        type: ApiExceptionResponseDto
    })
    async cancelOrder(@Req() request, @Param() param: CancelOrderParamDto) {
        if (!(await this.orderService.isOrderBelongToUser(param.id, request.user.id))) {
            throw new ForbiddenException('This order is not belong to you.');
        }
        await this.orderService.cancelOrder(param.id, true);
        return {};
    }
}
