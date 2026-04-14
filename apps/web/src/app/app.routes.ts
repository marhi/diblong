import { Routes } from '@angular/router';
import { PATHS, type Lang } from './core/store-paths';
import { ADMIN_ROUTES } from './admin/admin.routes';

function storeChildRoutes(lang: Lang): Routes {
  const p = PATHS[lang];
  return [
    {
      path: '',
      loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePageComponent),
    },
    {
      path: p.shop,
      loadComponent: () => import('./pages/shop/shop.page').then((m) => m.ShopPageComponent),
    },
    {
      path: `${p.category}/:slug`,
      loadComponent: () =>
        import('./pages/category/category.page').then((m) => m.CategoryPageComponent),
    },
    {
      path: `${p.product}/:slug`,
      loadComponent: () =>
        import('./pages/product/product.page').then((m) => m.ProductPageComponent),
    },
    {
      path: p.about,
      loadComponent: () => import('./pages/cms/cms.page').then((m) => m.CmsPageComponent),
      data: { cmsSlug: p.about },
    },
    {
      path: p.faq,
      loadComponent: () => import('./pages/cms/cms.page').then((m) => m.CmsPageComponent),
      data: { cmsSlug: p.faq },
    },
    {
      path: p.shipping,
      loadComponent: () => import('./pages/cms/cms.page').then((m) => m.CmsPageComponent),
      data: { cmsSlug: p.shipping },
    },
    {
      path: p.privacy,
      loadComponent: () => import('./pages/cms/cms.page').then((m) => m.CmsPageComponent),
      data: { cmsSlug: p.privacy },
    },
    {
      path: p.terms,
      loadComponent: () => import('./pages/cms/cms.page').then((m) => m.CmsPageComponent),
      data: { cmsSlug: p.terms },
    },
    {
      path: p.contact,
      loadComponent: () => import('./pages/cms/cms.page').then((m) => m.CmsPageComponent),
      data: { cmsSlug: p.contact },
    },
    {
      path: p.cart,
      loadComponent: () => import('./pages/cart/cart.page').then((m) => m.CartPageComponent),
    },
    {
      path: p.checkout,
      loadComponent: () =>
        import('./pages/checkout/checkout.page').then((m) => m.CheckoutPageComponent),
    },
    {
      path: p.account,
      loadComponent: () =>
        import('./pages/account/account.page').then((m) => m.AccountPageComponent),
    },
    {
      path: p.search,
      loadComponent: () =>
        import('./pages/search/search.page').then((m) => m.SearchPageComponent),
    },
    {
      path: p.orderSuccess,
      loadComponent: () =>
        import('./pages/order-result/order-success.page').then((m) => m.OrderSuccessPageComponent),
    },
    {
      path: p.orderFail,
      loadComponent: () =>
        import('./pages/order-result/order-fail.page').then((m) => m.OrderFailPageComponent),
    },
  ];
}

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'sl' },
  {
    path: 'sl',
    loadComponent: () =>
      import('./layout/store-shell.component').then((m) => m.StoreShellComponent),
    data: { lang: 'sl' as Lang, paths: PATHS.sl },
    children: storeChildRoutes('sl'),
  },
  {
    path: 'en',
    loadComponent: () =>
      import('./layout/store-shell.component').then((m) => m.StoreShellComponent),
    data: { lang: 'en' as Lang, paths: PATHS.en },
    children: storeChildRoutes('en'),
  },
  {
    path: 'hr',
    loadComponent: () =>
      import('./layout/store-shell.component').then((m) => m.StoreShellComponent),
    data: { lang: 'hr' as Lang, paths: PATHS.hr },
    children: storeChildRoutes('hr'),
  },
  { path: 'admin', children: ADMIN_ROUTES },
  { path: '**', redirectTo: 'sl' },
];
