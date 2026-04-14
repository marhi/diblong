import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly b = environment.apiBaseUrl;

  stats(): Observable<unknown> {
    return this.http.get(`${this.b}/admin/dashboard/stats`);
  }

  orders(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.b}/admin/orders`);
  }

  order(id: string): Observable<unknown> {
    return this.http.get(`${this.b}/admin/orders/${id}`);
  }

  patchOrderStatus(id: string, status: string): Observable<unknown> {
    return this.http.patch(`${this.b}/admin/orders/${id}/status`, { status });
  }

  patchOrderNotes(id: string, adminNotes: string): Observable<unknown> {
    return this.http.patch(`${this.b}/admin/orders/${id}/notes`, { adminNotes });
  }

  users(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.b}/admin/users`);
  }

  patchUser(id: string, body: { isActive?: boolean }): Observable<unknown> {
    return this.http.patch(`${this.b}/admin/users/${id}`, body);
  }

  patchUserRoles(id: string, roles: string[]): Observable<unknown> {
    return this.http.patch(`${this.b}/admin/users/${id}/roles`, { roles });
  }

  products(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.b}/admin/catalog/products`);
  }

  product(id: string): Observable<unknown> {
    return this.http.get(`${this.b}/admin/catalog/products/${id}`);
  }

  patchProduct(id: string, body: Record<string, unknown>): Observable<unknown> {
    return this.http.patch(`${this.b}/admin/catalog/products/${id}`, body);
  }

  patchProductTranslation(
    productId: string,
    translationId: string,
    body: Record<string, unknown>,
  ): Observable<unknown> {
    return this.http.patch(
      `${this.b}/admin/catalog/products/${productId}/translations/${translationId}`,
      body,
    );
  }

  categories(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.b}/admin/catalog/categories`);
  }

  category(id: string): Observable<unknown> {
    return this.http.get(`${this.b}/admin/catalog/categories/${id}`);
  }

  patchCategory(id: string, body: Record<string, unknown>): Observable<unknown> {
    return this.http.patch(`${this.b}/admin/catalog/categories/${id}`, body);
  }

  patchCategoryTranslation(
    categoryId: string,
    translationId: string,
    body: Record<string, unknown>,
  ): Observable<unknown> {
    return this.http.patch(
      `${this.b}/admin/catalog/categories/${categoryId}/translations/${translationId}`,
      body,
    );
  }

  shippingTree(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.b}/admin/shipping`);
  }

  patchShippingCountry(id: string, body: Record<string, unknown>): Observable<unknown> {
    return this.http.patch(`${this.b}/admin/shipping/countries/${id}`, body);
  }

  patchShippingRate(id: string, body: Record<string, unknown>): Observable<unknown> {
    return this.http.patch(`${this.b}/admin/shipping/rates/${id}`, body);
  }

  cmsPages(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.b}/admin/pages/cms`);
  }

  patchPageTranslation(id: string, body: Record<string, unknown>): Observable<unknown> {
    return this.http.patch(`${this.b}/admin/pages/cms/translations/${id}`, body);
  }

  mediaList(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.b}/admin/media`);
  }

  importMediaUrl(url: string): Observable<unknown> {
    return this.http.post(`${this.b}/admin/media/import-url`, { url });
  }

  uploadMedia(file: File): Observable<unknown> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post(`${this.b}/admin/media/upload`, fd);
  }

  promoBanners(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.b}/admin/promo/banners`);
  }

  patchPromoBanner(id: string, body: Record<string, unknown>): Observable<unknown> {
    return this.http.patch(`${this.b}/admin/promo/banners/${id}`, body);
  }

  seoEntries(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.b}/admin/seo/entries`);
  }

  upsertSeoEntry(body: Record<string, unknown>): Observable<unknown> {
    return this.http.post(`${this.b}/admin/seo/entries`, body);
  }

  patchSeoEntry(id: string, body: Record<string, unknown>): Observable<unknown> {
    return this.http.patch(`${this.b}/admin/seo/entries/${id}`, body);
  }

  settings(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.b}/admin/settings`);
  }

  patchSetting(key: string, value: Record<string, unknown>): Observable<unknown> {
    return this.http.patch(`${this.b}/admin/settings/${encodeURIComponent(key)}`, { value });
  }
}
