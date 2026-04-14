import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async stats() {
    const [orderGroups, productCount, userCount, paidSum, lowStock] = await Promise.all([
      this.prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.product.count(),
      this.prisma.user.count(),
      this.prisma.order.aggregate({
        where: {
          status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
        },
        _sum: { total: true },
      }),
      this.prisma.product.count({ where: { stock: { lt: 10 }, isActive: true } }),
    ]);
    return {
      ordersByStatus: orderGroups.map((g) => ({
        status: g.status,
        count: g._count._all,
      })),
      products: productCount,
      users: userCount,
      revenueTotal: paidSum._sum.total?.toString() ?? '0',
      lowStockProducts: lowStock,
    };
  }
}
