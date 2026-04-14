import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';

@ApiTags('cart')
@Public()
@Controller('cart')
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Post()
  create() {
    return this.cart.createGuestCart();
  }

  @Get(':id')
  get(@Param('id') id: string, @Query('guestToken') guestToken?: string) {
    return this.cart.getCart(id, guestToken);
  }

  @Post(':id/items')
  addItem(@Param('id') id: string, @Body() dto: AddCartItemDto) {
    return this.cart.addItem(id, dto.guestToken, dto.productId, dto.qty);
  }

  @Delete(':id/items/:productId')
  removeItem(
    @Param('id') id: string,
    @Param('productId') productId: string,
    @Query('guestToken') guestToken?: string,
  ) {
    return this.cart.removeItem(id, guestToken, productId);
  }
}
