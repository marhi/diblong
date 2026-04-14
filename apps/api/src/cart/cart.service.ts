import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async createGuestCart() {
    return this.prisma.cart.create({
      data: { guestToken: randomUUID() },
      include: { items: true },
    });
  }

  async getCart(id: string, guestToken?: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                translations: true,
                images: { take: 1, include: { media: true } },
              },
            },
          },
        },
      },
    });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    if (cart.guestToken && cart.guestToken !== guestToken) {
      throw new NotFoundException('Cart not found');
    }
    return cart;
  }

  async addItem(cartId: string, guestToken: string | undefined, productId: string, qty: number) {
    await this.getCart(cartId, guestToken);
    return this.prisma.cartItem.upsert({
      where: { cartId_productId: { cartId, productId } },
      update: { qty },
      create: { cartId, productId, qty },
      include: {
        product: {
          include: { translations: true, images: { take: 1, include: { media: true } } },
        },
      },
    });
  }

  async removeItem(cartId: string, guestToken: string | undefined, productId: string) {
    await this.getCart(cartId, guestToken);
    await this.prisma.cartItem.deleteMany({ where: { cartId, productId } });
    return { ok: true };
  }
}
