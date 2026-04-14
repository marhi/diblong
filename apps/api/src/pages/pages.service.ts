import { Injectable, NotFoundException } from '@nestjs/common';
import { Locale } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PagesService {
  constructor(private readonly prisma: PrismaService) {}

  async getBySlug(locale: Locale, slug: string) {
    const page = await this.prisma.pageTranslation.findFirst({
      where: { locale, slug },
      include: { page: true },
    });
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    return page;
  }
}
