import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: ':name',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      return [
        { name: 'kosj' },
        { name: 'kairo' }
      ];
    }
  },
  {
    path: ':name/historia',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      return [
        { name: 'kosj' },
        { name: 'kairo' }
      ];
    }
  },
  {
    path: ':name/ficha',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      return [
        { name: 'kosj' },
        { name: 'kairo' }
      ];
    }
  },
  {
    path: ':name/lacos',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      return [
        { name: 'kosj' },
        { name: 'kairo' }
      ];
    }
  },
  {
    path: ':name/raca',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      return [
        { name: 'kosj' },
        { name: 'kairo' }
      ];
    }
  },
  {
    path: ':name/classe',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      return [
        { name: 'kosj' },
        { name: 'kairo' }
      ];
    }
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];

