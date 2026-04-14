import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { ShippingService } from '../shipping/shipping.service';
import { PaymentsService } from '../payments/payments.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cart: CartService,
    private readonly shipping: ShippingService,
    private readonly payments: PaymentsService,
  ) {}

  async checkout(dto: CreateOrderDto) {
    const cart = await this.cart.getCart(dto.cartId, dto.guestToken);
    if (!cart.items.length) {
      throw new BadRequestException('Cart is empty');
    }
    const country = dto.shippingAddress.countryCode.toUpperCase();
    const lines: { productId: string; title: string; unitPrice: number; qty: number }[] =
      [];
    let subtotal = 0;
    for (const item of cart.items) {
      const loc = dto.locale ?? 'sl';
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
        include: { translations: { where: { locale: loc } } },
      });
      if (!product || !product.isActive) {
        throw new BadRequestException(`Product unavailable: ${item.productId}`);
      }
      if (product.stock < item.qty) {
        throw new BadRequestException(`Insufficient stock: ${product.sku}`);
      }
      const title =
        product.translations[0]?.title ?? product.sku;
      const unit = Number(product.price);
      subtotal += unit * item.qty;
      lines.push({
        productId: product.id,
        title,
        unitPrice: unit,
        qty: item.qty,
      });
    }
    const ship = await this.shipping.quote(country, subtotal);
    const total = subtotal + ship.total;
    const order = await this.prisma.order.create({
      data: {
        guestEmail: dto.guestEmail,
        status: OrderStatus.PENDING,
        countryCode: country,
        subtotal,
        shippingTotal: ship.total,
        total,
        shippingAddress: dto.shippingAddress as unknown as Prisma.InputJsonValue,
        items: {
          create: lines.map((l) => ({
            productId: l.productId,
            titleSnapshot: l.title,
            unitPrice: l.unitPrice,
            qty: l.qty,
          })),
        },
      },
    });
    const pay = await this.payments.authorizeWithDefault({
      amount: total,
      currency: 'EUR',
      orderId: order.id,
      customerEmail: dto.guestEmail,
    });
    if (!pay.success) {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CANCELED, paymentReference: pay.message },
      });
      throw new BadRequestException(pay.message ?? 'Payment failed');
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.PAID,
          paymentProvider: pay.providerId,
          paymentReference: pay.reference,
        },
      });
      for (const line of lines) {
        await tx.product.update({
          where: { id: line.productId },
          data: { stock: { decrement: line.qty } },
        });
      }
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    });
    return this.prisma.order.findUniqueOrThrow({
      where: { id: order.id },
      include: { items: true },
    });
  }

  async listForUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
  }

  async adminList() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { items: true, user: { select: { email: true, id: true } } },
    });
  }

  async adminUpdateStatus(id: string, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException();
    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });
  }

  async adminGetById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });
    if (!order) throw new NotFoundException();
    return order;
  }

  async adminPatchNotes(id: string, adminNotes: string | undefined) {
    await this.adminGetById(id);
    return this.prisma.order.update({
      where: { id },
      data: { adminNotes },
      include: { items: true, user: { select: { email: true, id: true } } },
    });
  }
}
