import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShippingService {
  constructor(private readonly prisma: PrismaService) {}

  async listCountries() {
    return this.prisma.shippingCountry.findMany({
      orderBy: { code: 'asc' },
      include: {
        zone: { include: { rates: true } },
      },
    });
  }

  async quote(countryCode: string, subtotal: number) {
    const country = await this.prisma.shippingCountry.findUnique({
      where: { code: countryCode.toUpperCase() },
      include: { zone: { include: { rates: { take: 1 } } } },
    });
    if (!country || !country.zone.rates[0]) {
      return { flat: 0, total: 0, freeThreshold: null as number | null };
    }
    const rate = country.zone.rates[0];
    const flat = Number(rate.flatRate);
    const threshold = rate.freeShippingThreshold
      ? Number(rate.freeShippingThreshold)
      : null;
    const shipping =
      threshold != null && subtotal >= threshold ? 0 : flat;
    return {
      flat,
      total: shipping,
      freeThreshold: threshold,
      zoneName: country.zone.name,
      notes: {
        sl: country.notesSl,
        en: country.notesEn,
        hr: country.notesHr,
      },
    };
  }
}
