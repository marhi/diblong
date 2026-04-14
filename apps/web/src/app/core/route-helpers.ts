import { ActivatedRoute } from '@angular/router';
import { PATHS, type Lang, type StorePaths } from './store-paths';

export function readLang(route: ActivatedRoute): Lang {
  let r: ActivatedRoute | null = route;
  while (r && !r.snapshot.data['lang']) {
    r = r.parent;
  }
  return (r?.snapshot.data['lang'] ?? 'sl') as Lang;
}

export function readPaths(route: ActivatedRoute): StorePaths {
  let r: ActivatedRoute | null = route;
  while (r && !r.snapshot.data['paths']) {
    r = r.parent;
  }
  return (r?.snapshot.data['paths'] as StorePaths | undefined) ?? PATHS.sl;
}
