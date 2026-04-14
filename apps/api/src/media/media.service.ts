import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.mediaAsset.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async createFromDisk(fileName: string, mimeType: string) {
    return this.prisma.mediaAsset.create({
      data: {
        storedPath: `/uploads/${fileName}`,
        mimeType,
        fileName,
      },
    });
  }

  async importRemote(url: string) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new NotFoundException(`Remote fetch failed: ${res.status}`);
    }
    const mimeType = res.headers.get('content-type');
    const extGuess = url.split('.').pop()?.split('?')[0] ?? 'bin';
    const ext = ['webp', 'png', 'jpg', 'jpeg'].includes(extGuess)
      ? extGuess
      : 'bin';
    const fileName = `import-${randomUUID().slice(0, 8)}.${ext}`;
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const dest = path.join(uploadsDir, fileName);
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    return this.prisma.mediaAsset.create({
      data: {
        sourceUrl: url,
        storedPath: `/uploads/${fileName}`,
        mimeType: mimeType ?? undefined,
        fileName,
      },
    });
  }
}
