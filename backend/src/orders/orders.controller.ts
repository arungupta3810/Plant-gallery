import {
  Body, Controller, Get, Param, Patch, Post, UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private orders: OrdersService) {}

  // Checkout — works for guests and logged-in customers.
  @UseGuards(OptionalJwtAuthGuard)
  @Post()
  create(@Body() dto: CreateOrderDto, @CurrentUser() user?: AuthUser) {
    return this.orders.create(dto, user?.id);
  }

  // Customer order history
  @UseGuards(JwtAuthGuard)
  @Get('mine')
  mine(@CurrentUser() user: AuthUser) {
    return this.orders.listForUser(user.id);
  }

  // Public order tracking by number
  @Get('track/:number')
  track(@Param('number') number: string) {
    return this.orders.track(number);
  }

  // ----- Admin -----

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Get()
  listAll() {
    return this.orders.listAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Patch(':number/status')
  updateStatus(@Param('number') number: string, @Body() dto: UpdateOrderStatusDto) {
    return this.orders.updateStatus(number, dto);
  }
}
