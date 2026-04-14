import { Module } from '@nestjs/common';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminShippingController } from './admin-shipping.controller';
import { AdminPagesController } from './admin-pages.controller';
import { AdminPromoController } from './admin-promo.controller';
import { AdminSeoController } from './admin-seo.controller';
import { AdminSettingsController } from './admin-settings.controller';

@Module({
  controllers: [
    AdminDashboardController,
    AdminShippingController,
    AdminPagesController,
    AdminPromoController,
    AdminSeoController,
    AdminSettingsController,
  ],
  providers: [AdminDashboardService],
})
export class AdminModule {}
