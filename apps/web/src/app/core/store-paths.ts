export type Lang = 'sl' | 'en' | 'hr';

export type StorePaths = {
  shop: string;
  category: string;
  product: string;
  about: string;
  faq: string;
  shipping: string;
  privacy: string;
  terms: string;
  contact: string;
  cart: string;
  checkout: string;
  account: string;
  search: string;
  orderSuccess: string;
  orderFail: string;
};

export const PATHS: Record<Lang, StorePaths> = {
  sl: {
    shop: 'trgovina',
    category: 'kategorija',
    product: 'izdelek',
    about: 'o-znamki',
    faq: 'pogosta-vprasanja',
    shipping: 'dostava',
    privacy: 'politika-zasebnosti',
    terms: 'pogoji-poslovanja',
    contact: 'kontakt',
    cart: 'kosarica',
    checkout: 'blagajna',
    account: 'racun',
    search: 'iskanje',
    orderSuccess: 'narocilo-uspeh',
    orderFail: 'narocilo-neuspeh',
  },
  en: {
    shop: 'shop',
    category: 'category',
    product: 'product',
    about: 'about',
    faq: 'faq',
    shipping: 'shipping',
    privacy: 'privacy-policy',
    terms: 'terms',
    contact: 'contact',
    cart: 'cart',
    checkout: 'checkout',
    account: 'account',
    search: 'search',
    orderSuccess: 'order-success',
    orderFail: 'order-failed',
  },
  hr: {
    shop: 'trgovina',
    category: 'kategorija',
    product: 'proizvod',
    about: 'o-brendu',
    faq: 'cesta-pitanja',
    shipping: 'dostava',
    privacy: 'politika-privatnosti',
    terms: 'uvjeti-koristenja',
    contact: 'kontakt',
    cart: 'kosarica',
    checkout: 'blagajna',
    account: 'racun',
    search: 'pretraga',
    orderSuccess: 'narudzba-uspjeh',
    orderFail: 'narudzba-neuspjeh',
  },
};
