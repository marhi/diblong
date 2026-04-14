import { environment } from '../../environments/environment';

export function mediaUrl(storedPath?: string | null, sourceUrl?: string | null) {
  if (storedPath) {
    return storedPath.startsWith('http') ? storedPath : `${environment.apiOrigin}${storedPath}`;
  }
  return sourceUrl ?? null;
}
