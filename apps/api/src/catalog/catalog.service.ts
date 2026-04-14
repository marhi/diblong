import { Injectable, NotFoundException } from '@nestjs/common';
import { Locale, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const locales: Locale[] = ['sl', 'en', 'hr'];

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  assertLocale(locale: string): Locale {
    if (!locales.includes(locale as Locale)) {
      throw new NotFoundException('Unknown locale');
    }
    return locale as Locale;
  }

  async listCategories(locale: Locale) {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        translations: { where: { locale } },
        _count: { select: { products: true } },
      },
    });
  }

  async getCategoryBySlug(locale: Locale, slug: string) {
    const translation = await this.prisma.categoryTranslation.findFirst({
      where: { locale, slug },
      include: {
        category: {
          include: {
            products: {
              where: { isActive: true },
              include: {
                translations: { where: { locale } },
                images: {
                  orderBy: { sortOrder: 'asc' },
                  take: 1,
                  include: { media: true },
                },
              },
            },
          },
        },
      },
    });
    if (!translation) {
      throw new NotFoundException('Category not found');
    }
    return translation;
  }

  async listProducts(
    locale: Locale,
    params: {
      q?: string;
      categorySlug?: string;
      sort?: 'popularity' | 'newest' | 'price_asc' | 'price_desc';
      minPrice?: number;
      maxPrice?: number;
      featured?: boolean;
      bestseller?: boolean;
      skip?: number;
      take?: number;
    },
  ) {
    const take = Math.min(params.take ?? 24, 48);
    const skip = params.skip ?? 0;
    const where: Prisma.ProductWhereInput = { isActive: true };
    if (params.featured) where.isFeatured = true;
    if (params.bestseller) where.isBestseller = true;
    if (params.minPrice != null || params.maxPrice != null) {
      where.price = {};
      if (params.minPrice != null) where.price.gte = params.minPrice;
      if (params.maxPrice != null) where.price.lte = params.maxPrice;
    }
    if (params.categorySlug) {
      where.category = {
        translations: { some: { locale, slug: params.categorySlug } },
      };
    }
    if (params.q) {
      where.translations = {
        some: {
          locale,
          OR: [
            { title: { contains: params.q, mode: 'insensitive' } },
            { shortDescription: { contains: params.q, mode: 'insensitive' } },
          ],
        },
      };
    }
    const orderBy: Prisma.ProductOrderByWithRelationInput[] = [];
    switch (params.sort) {
      case 'price_asc':
        orderBy.push({ price: 'asc' });
        break;
      case 'price_desc':
        orderBy.push({ price: 'desc' });
        break;
      case 'newest':
        orderBy.push({ id: 'desc' });
        break;
      case 'popularity':
      default:
        orderBy.push({ popularity: 'desc' });
        break;
    }
    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          translations: { where: { locale } },
          images: {
            orderBy: { sortOrder: 'asc' },
            take: 1,
            include: { media: true },
          },
          category: { include: { translations: { where: { locale } } } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);
    return { items, total, skip, take };
  }

  async getProductBySlug(locale: Locale, slug: string) {
    const translation = await this.prisma.productTranslation.findFirst({
      where: { locale, slug },
      include: {
        product: {
          include: {
            images: { orderBy: { sortOrder: 'asc' }, include: { media: true } },
            category: { include: { translations: { where: { locale } } } },
            relatedFrom: {
              include: {
                toProduct: {
                  include: {
                    translations: { where: { locale } },
                    images: {
                      orderBy: { sortOrder: 'asc' },
                      take: 1,
                      include: { media: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!translation) {
      throw new NotFoundException('Product not found');
    }
    const alternates = await this.prisma.productTranslation.findMany({
      where: { productId: translation.productId },
      select: { locale: true, slug: true, canonicalPath: true },
    });
    return { ...translation, alternates };
  }

  async searchSuggest(locale: Locale, q: string) {
    if (!q || q.length < 2) return [];
    return this.prisma.productTranslation.findMany({
      where: {
        locale,
        title: { contains: q, mode: 'insensitive' },
      },
      take: 8,
      select: { title: true, slug: true, productId: true },
    });
  }
}
