import { Routes } from '@angular/router';
import { adminAuthGuard } from './admin-auth.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login.page').then((m) => m.AdminLoginPageComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./admin-shell.component').then((m) => m.AdminShellComponent),
    canActivate: [adminAuthGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard.page').then((m) => m.AdminDashboardPageComponent),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./pages/orders.page').then((m) => m.AdminOrdersPageComponent),
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./pages/order-detail.page').then((m) => m.AdminOrderDetailPageComponent),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/users.page').then((m) => m.AdminUsersPageComponent),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./pages/products.page').then((m) => m.AdminProductsPageComponent),
      },
      {
        path: 'products/:id',
        loadComponent: () =>
          import('./pages/product-edit.page').then((m) => m.AdminProductEditPageComponent),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./pages/categories.page').then((m) => m.AdminCategoriesPageComponent),
      },
      {
        path: 'categories/:id',
        loadComponent: () =>
          import('./pages/category-edit.page').then((m) => m.AdminCategoryEditPageComponent),
      },
      {
        path: 'inventory',
        loadComponent: () =>
          import('./pages/inventory.page').then((m) => m.AdminInventoryPageComponent),
      },
      {
        path: 'shipping',
        loadComponent: () =>
          import('./pages/shipping.page').then((m) => m.AdminShippingPageComponent),
      },
      {
        path: 'cms',
        loadComponent: () =>
          import('./pages/cms.page').then((m) => m.AdminCmsPageComponent),
      },
      {
        path: 'media',
        loadComponent: () =>
          import('./pages/media.page').then((m) => m.AdminMediaPageComponent),
      },
      {
        path: 'promo',
        loadComponent: () =>
          import('./pages/promo.page').then((m) => m.AdminPromoPageComponent),
      },
      {
        path: 'seo',
        loadComponent: () =>
          import('./pages/seo.page').then((m) => m.AdminSeoPageComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings.page').then((m) => m.AdminSettingsPageComponent),
      },
    ],
  },
];
