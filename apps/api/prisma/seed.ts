import {
  PrismaClient,
  Locale,
  RoleName,
  PageKey,
  OrderStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

type Triple = { sl: string; en: string; hr: string };

async function downloadMedia(
  url: string,
  baseName: string,
): Promise<{ sourceUrl: string; storedPath: string; mimeType: string | null; fileName: string }> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  const mimeType = res.headers.get('content-type');
  const ext =
    url.includes('.webp')
      ? 'webp'
      : url.includes('.png')
        ? 'png'
        : url.toLowerCase().includes('.jpg')
          ? 'jpg'
          : 'bin';
  const fileName = `${baseName}-${randomUUID().slice(0, 8)}.${ext}`;
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const dest = path.join(uploadsDir, fileName);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buffer);
  return {
    sourceUrl: url,
    storedPath: `/uploads/${fileName}`,
    mimeType,
    fileName,
  };
}

async function seedRoles() {
  for (const name of [RoleName.CUSTOMER, RoleName.STAFF, RoleName.ADMIN]) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
}

async function seedAdmin() {
  const passwordHash = await bcrypt.hash('Admin123!', 12);
  const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: RoleName.ADMIN } });
  const customerRole = await prisma.role.findUniqueOrThrow({
    where: { name: RoleName.CUSTOMER },
  });
  const user = await prisma.user.upsert({
    where: { email: 'admin@diblong.com' },
    update: { passwordHash },
    create: {
      email: 'admin@diblong.com',
      passwordHash,
      firstName: 'Diblong',
      lastName: 'Admin',
      roles: {
        create: [{ roleId: adminRole.id }, { roleId: customerRole.id }],
      },
    },
  });
  return user;
}

async function seedShipping() {
  const eu = await prisma.shippingZone.upsert({
    where: { id: 'zone-eu' },
    update: { name: 'EU' },
    create: { id: 'zone-eu', name: 'EU', sortOrder: 1 },
  });
  const balkan = await prisma.shippingZone.upsert({
    where: { id: 'zone-balkan' },
    update: { name: 'Balkan' },
    create: { id: 'zone-balkan', name: 'Balkan', sortOrder: 2 },
  });
  await prisma.shippingRate.upsert({
    where: { id: 'rate-eu' },
    update: {},
    create: {
      id: 'rate-eu',
      zoneId: eu.id,
      flatRate: 4.9,
      freeShippingThreshold: 79,
    },
  });
  await prisma.shippingRate.upsert({
    where: { id: 'rate-balkan' },
    update: {},
    create: {
      id: 'rate-balkan',
      zoneId: balkan.id,
      flatRate: 6.9,
      freeShippingThreshold: 89,
    },
  });
  const countries: { code: string; zoneId: string; notes: Triple }[] = [
    {
      code: 'SI',
      zoneId: eu.id,
      notes: {
        sl: 'Dostava v 1–3 delovnih dneh po potrditvi plačila.',
        en: 'Delivery in 1–3 business days after payment confirmation.',
        hr: 'Dostava za 1–3 radna dana nakon potvrde plaćanja.',
      },
    },
    {
      code: 'HR',
      zoneId: balkan.id,
      notes: {
        sl: 'Dostava v 2–4 delovnih dneh; carinske formalnosti lahko podaljšajo rok.',
        en: 'Delivery in 2–4 business days; customs may extend timelines.',
        hr: 'Dostava za 2–4 radna dana; carina može produžiti rok.',
      },
    },
    {
      code: 'DE',
      zoneId: eu.id,
      notes: {
        sl: 'Dostava v 3–5 delovnih dneh.',
        en: 'Delivery in 3–5 business days.',
        hr: 'Dostava za 3–5 radnih dana.',
      },
    },
  ];
  for (const c of countries) {
    await prisma.shippingCountry.upsert({
      where: { code: c.code },
      update: {
        zoneId: c.zoneId,
        notesSl: c.notes.sl,
        notesEn: c.notes.en,
        notesHr: c.notes.hr,
      },
      create: {
        code: c.code,
        zoneId: c.zoneId,
        notesSl: c.notes.sl,
        notesEn: c.notes.en,
        notesHr: c.notes.hr,
      },
    });
  }
}

const faqJson = (items: { q: Triple; a: Triple }[]) =>
  JSON.stringify(
    items.map((i) => ({
      q: { sl: i.q.sl, en: i.q.en, hr: i.q.hr },
      a: { sl: i.a.sl, en: i.a.en, hr: i.a.hr },
    })),
  );

async function seedPages() {
  const pages: {
    key: PageKey;
    slugs: Triple;
    titles: Triple;
    bodies: Triple;
    meta: Triple;
  }[] = [
    {
      key: PageKey.ABOUT,
      slugs: { sl: 'o-znamki', en: 'about', hr: 'o-brendu' },
      titles: { sl: 'O znamki', en: 'About the brand', hr: 'O brendu' },
      bodies: {
        sl: '<p>Diblong je globalna znamka odraslih zeliščnih izdelkov, zasnovana za diskretno, elegantno doživetje intimnega dobrega počutja. Naša oblika, vonj in tekstura so skrbno uravnoteženi za sodoben, premičen življenjski slog.</p>',
        en: '<p>Diblong is a global adult herbal brand crafted for discreet, elegant intimate wellness. Form, aroma, and texture are balanced for a modern, premium lifestyle.</p>',
        hr: '<p>Diblong je globalni biljni brend za odrasle, oblikovan za diskretno, elegantno intimno dobrobit. Tekstura i nota pažljivo su uravnotežene za suvremeni, premium životni stil.</p>',
      },
      meta: {
        sl: 'Diblong — o znamki in filozofiji premium intimne nege.',
        en: 'Diblong — brand story and philosophy of premium intimate care.',
        hr: 'Diblong — priča o brendu i filozofiji premium intimne njege.',
      },
    },
    {
      key: PageKey.FAQ,
      slugs: { sl: 'pogosta-vprasanja', en: 'faq', hr: 'cesta-pitanja' },
      titles: { sl: 'Pogosta vprašanja', en: 'FAQ', hr: 'Česta pitanja' },
      bodies: {
        sl: '<p>Odgovori na najpogostejša vprašanja o naročilih, dostavi in zasebnosti.</p>',
        en: '<p>Answers about orders, delivery, and privacy.</p>',
        hr: '<p>Odgovori o narudžbama, dostavi i privatnosti.</p>',
      },
      meta: {
        sl: 'Pogosta vprašanja — Diblong trgovina.',
        en: 'Frequently asked questions — Diblong shop.',
        hr: 'Česta pitanja — Diblong trgovina.',
      },
    },
    {
      key: PageKey.SHIPPING,
      slugs: { sl: 'dostava', en: 'shipping', hr: 'dostava' },
      titles: {
        sl: 'Dostava in prevzem',
        en: 'Shipping & delivery',
        hr: 'Dostava i isporuka',
      },
      bodies: {
        sl: '<p>Dostavljamo v več držav. Stroške dostave izračunamo ob zaključku nakupa glede na državo in veljavne tarife.</p>',
        en: '<p>We ship to multiple countries. Shipping is calculated at checkout based on country and active rates.</p>',
        hr: '<p>Isporuka u više zemalja. Trošak se obračunava pri završetku kupnje prema zemlji i tarifama.</p>',
      },
      meta: {
        sl: 'Informacije o dostavi — Diblong.',
        en: 'Shipping information — Diblong.',
        hr: 'Informacije o dostavi — Diblong.',
      },
    },
    {
      key: PageKey.PRIVACY,
      slugs: {
        sl: 'politika-zasebnosti',
        en: 'privacy-policy',
        hr: 'politika-privatnosti',
      },
      titles: {
        sl: 'Politika zasebnosti',
        en: 'Privacy policy',
        hr: 'Politika privatnosti',
      },
      bodies: {
        sl: '<p>Varujemo vaše podatke v skladu z veljavno zakonodajo. Kontakt: privacy@diblong.com (vzorec).</p>',
        en: '<p>We protect your data in line with applicable law. Contact: privacy@diblong.com (sample).</p>',
        hr: '<p>Štitimo vaše podatke u skladu s važećim propisima. Kontakt: privacy@diblong.com (uzorak).</p>',
      },
      meta: {
        sl: 'Politika zasebnosti — Diblong.',
        en: 'Privacy policy — Diblong.',
        hr: 'Politika privatnosti — Diblong.',
      },
    },
    {
      key: PageKey.TERMS,
      slugs: { sl: 'pogoji-poslovanja', en: 'terms', hr: 'uvjeti-koristenja' },
      titles: {
        sl: 'Pogoji poslovanja',
        en: 'Terms & conditions',
        hr: 'Uvjeti korištenja',
      },
      bodies: {
        sl: '<p>Splošni pogoji nakupa v spletni trgovini Diblong (vzorec dokumenta za razvoj).</p>',
        en: '<p>General terms for purchases at Diblong online shop (sample for development).</p>',
        hr: '<p>Opći uvjeti kupnje u web trgovini Diblong (uzorak za razvoj).</p>',
      },
      meta: {
        sl: 'Pogoji poslovanja — Diblong.',
        en: 'Terms & conditions — Diblong.',
        hr: 'Uvjeti korištenja — Diblong.',
      },
    },
    {
      key: PageKey.CONTACT,
      slugs: { sl: 'kontakt', en: 'contact', hr: 'kontakt' },
      titles: { sl: 'Kontakt', en: 'Contact', hr: 'Kontakt' },
      bodies: {
        sl: '<p>Za B2B in medijske povpraševanja pišite na support@diblong.com (vzorec).</p>',
        en: '<p>For B2B and media inquiries write to support@diblong.com (sample).</p>',
        hr: '<p>Za B2B i medijske upite pišite na support@diblong.com (uzorak).</p>',
      },
      meta: {
        sl: 'Kontakt — Diblong.',
        en: 'Contact — Diblong.',
        hr: 'Kontakt — Diblong.',
      },
    },
  ];
  for (const p of pages) {
    const page = await prisma.page.upsert({
      where: { key: p.key },
      update: {},
      create: { key: p.key },
    });
    const locales: Locale[] = ['sl', 'en', 'hr'];
    const data = {
      sl: {
        title: p.titles.sl,
        slug: p.slugs.sl,
        body: p.bodies.sl,
        meta: p.meta.sl,
      },
      en: {
        title: p.titles.en,
        slug: p.slugs.en,
        body: p.bodies.en,
        meta: p.meta.en,
      },
      hr: {
        title: p.titles.hr,
        slug: p.slugs.hr,
        body: p.bodies.hr,
        meta: p.meta.hr,
      },
    };
    for (const loc of locales) {
      const d = data[loc];
      const existing = await prisma.pageTranslation.findFirst({
        where: { pageId: page.id, locale: loc },
      });
      if (existing) {
        await prisma.pageTranslation.update({
          where: { id: existing.id },
          data: {
            title: d.title,
            slug: d.slug,
            bodyHtml: d.body,
            metaTitle: `${d.title} | Diblong`,
            metaDescription: d.meta,
            ogTitle: d.title,
            ogDescription: d.meta,
            canonicalPath: `/${loc}/${d.slug}`,
          },
        });
      } else {
        await prisma.pageTranslation.create({
          data: {
            pageId: page.id,
            locale: loc,
            title: d.title,
            slug: d.slug,
            bodyHtml: d.body,
            metaTitle: `${d.title} | Diblong`,
            metaDescription: d.meta,
            ogTitle: d.title,
            ogDescription: d.meta,
            canonicalPath: `/${loc}/${d.slug}`,
          },
        });
      }
    }
  }
}

type SeedProduct = {
  sku: string;
  price: number;
  stock: number;
  featured?: boolean;
  bestseller?: boolean;
  popularity?: number;
  images?: string[];
  titles: Triple;
  slugs: Triple;
  short: Triple;
  long: Triple;
  usage: Triple;
  disclaimer: Triple;
  faq?: { q: Triple; a: Triple }[];
};

async function seedCatalog(mediaMap: Record<string, string>) {
  const cat = await prisma.category.upsert({
    where: { id: 'cat-diblong-main' },
    update: { sortOrder: 1, isActive: true },
    create: {
      id: 'cat-diblong-main',
      sortOrder: 1,
      translations: {
        create: [
          {
            locale: 'sl',
            title: 'Diblong linija',
            slug: 'diblong-linija',
            introHtml:
              '<p>Izbrana linija zeliščnih izdelkov za zrelo, elegantno doživetje vsakdana. Teksture in formule so prilagojene ritualu nege.</p>',
            faqJson: faqJson([
              {
                q: {
                  sl: 'Ali so izdelki diskretno pakirani?',
                  en: 'Is packaging discreet?',
                  hr: 'Je li pakiranje diskretno?',
                },
                a: {
                  sl: 'Da — nevpadljiva pošiljka brez opisnih oznak vsebine.',
                  en: 'Yes — neutral outer packaging without descriptive markings.',
                  hr: 'Da — neutralno vanjsko pakiranje bez opisnih oznaka.',
                },
              },
            ]),
            metaTitle: 'Kategorija Diblong | Premium intimna nega',
            metaDescription:
              'Odkrijte Diblong linijo: zeliščni rituali nege v premium izvedbi.',
            ogTitle: 'Diblong linija',
            ogDescription: 'Premium zeliščna linija za intimno dobrobit.',
            canonicalPath: '/sl/kategorija/diblong-linija',
          },
          {
            locale: 'en',
            title: 'Diblong line',
            slug: 'diblong-line',
            introHtml:
              '<p>A curated herbal line for a mature, elegant daily ritual. Textures and formulas support mindful care.</p>',
            faqJson: faqJson([
              {
                q: {
                  sl: 'Ali so izdelki diskretno pakirani?',
                  en: 'Is packaging discreet?',
                  hr: 'Je li pakiranje diskretno?',
                },
                a: {
                  sl: 'Da — nevpadljiva pošiljka brez opisnih oznak vsebine.',
                  en: 'Yes — neutral outer packaging without descriptive markings.',
                  hr: 'Da — neutralno vanjsko pakiranje bez opisnih oznaka.',
                },
              },
            ]),
            metaTitle: 'Diblong category | Premium intimate care',
            metaDescription:
              'Explore the Diblong line — herbal rituals in a premium expression.',
            ogTitle: 'Diblong line',
            ogDescription: 'Premium herbal line for intimate wellness.',
            canonicalPath: '/en/category/diblong-line',
          },
          {
            locale: 'hr',
            title: 'Diblong linija',
            slug: 'diblong-linija',
            introHtml:
              '<p>Odabrana biljna linija za zrelo, elegantno svakodnevicu. Teksture i formule podržavaju njegu kao ritual.</p>',
            faqJson: faqJson([
              {
                q: {
                  sl: 'Ali so izdelki diskretno pakirani?',
                  en: 'Is packaging discreet?',
                  hr: 'Je li pakiranje diskretno?',
                },
                a: {
                  sl: 'Da — nevpadljiva pošiljka brez opisnih oznak vsebine.',
                  en: 'Yes — neutral outer packaging without descriptive markings.',
                  hr: 'Da — neutralno vanjsko pakiranje bez opisnih oznaka.',
                },
              },
            ]),
            metaTitle: 'Diblong linija | Premium intimna njega',
            metaDescription:
              'Otkrijte Diblong liniju — biljni rituali u premium izvedbi.',
            ogTitle: 'Diblong linija',
            ogDescription: 'Premium biljna linija za intimnu dobrobit.',
            canonicalPath: '/hr/kategorija/diblong-linija',
          },
        ],
      },
    },
  });

  const products: SeedProduct[] = [
    {
      sku: 'DL-DRINK',
      price: 34.9,
      stock: 120,
      featured: true,
      popularity: 88,
      titles: {
        sl: 'Diblong Drink',
        en: 'Diblong Drink',
        hr: 'Diblong Drink',
      },
      slugs: { sl: 'diblong-drink', en: 'diblong-drink', hr: 'diblong-drink' },
      short: {
        sl: 'Uravnotežena pijača za večerno umiritev in zrelo doživetje.',
        en: 'A balanced drink for evening ease and a mature, composed mood.',
        hr: 'Uravnoteženo piće za večernje smirivanje i zrelo iskustvo.',
      },
      long: {
        sl: '<p>Subtilna nota zelišč in elegantna sladkoba ustvarita za trenutke, ko želite počasnejši ritem. Priporočamo zmernost in spoštovanje osebnih meja.</p>',
        en: '<p>Subtle herbal notes and refined sweetness for moments when you want a slower rhythm. Moderation and personal boundaries matter.</p>',
        hr: '<p>Suptilne biljne note i elegantna slatkoća za trenutke sporijeg ritma. Umjerenost i osobne granice su bitne.</p>',
      },
      usage: {
        sl: 'Servirajte ohlajeno. Ne mešajte z alkoholom, če ste občutljivi na stimulacije.',
        en: 'Serve chilled. Avoid mixing with alcohol if you are stimulation-sensitive.',
        hr: 'Poslužite ohlađeno. Izbjegavajte miješanje s alkoholom ako ste osjetljivi.',
      },
      disclaimer: {
        sl: 'Prehransko dopolnilo ni nadomestek za uravnoteženo prehrano. Shranjujte izven dosega otrok.',
        en: 'Food supplement is not a substitute for a balanced diet. Keep away from children.',
        hr: 'Dodatak prehrani nije zamjena za uravnoteženu prehranu. Čuvati izvan dosega djece.',
      },
    },
    {
      sku: 'DL-SHOT',
      price: 6.9,
      stock: 400,
      bestseller: true,
      featured: true,
      popularity: 100,
      images: ['https://diblong.com/assets/images/shot-yazi-yani.webp'],
      titles: { sl: 'Diblong Shot', en: 'Diblong Shot', hr: 'Diblong Shot' },
      slugs: { sl: 'diblong-shot', en: 'diblong-shot', hr: 'diblong-shot' },
      short: {
        sl: 'Kompaktna izkušnja — intenzivna aromatičnost v elegantnem formatu.',
        en: 'A compact experience — aromatic intensity in an elegant format.',
        hr: 'Kompaktno iskustvo — aromatična intenzivnost u elegantnom formatu.',
      },
      long: {
        sl: '<p>Shot oblika je zasnovana za hitro pripravo in diskretno uživanje. Tekstura je gladka, okus pa uravnotežen, da ohranja premičen ton znamke.</p>',
        en: '<p>The shot format is designed for quick preparation and discreet enjoyment. Smooth texture, balanced taste, premium tone.</p>',
        hr: '<p>Shot format brza priprema i diskretno uživanje. Glatka tekstura, uravnotežen okus, premium ton.',
      },
      usage: {
        sl: 'Zaužijte neposredno iz stekleničke. Priporočena količina: 1 način uporabe na dogodek.',
        en: 'Consume directly from the vial. Recommended: single serving per occasion.',
        hr: 'Konumirajte iz bočice. Preporuka: jedna porcija po prigodi.',
      },
      disclaimer: {
        sl: 'Ni primeren za nosečnice in mladoletnike. Pri zdravstvenih težavah se posvetujte z zdravnikom.',
        en: 'Not suitable for pregnancy or minors. Consult a clinician if you have health concerns.',
        hr: 'Nije prikladno za trudnoće i maloljetnike. Posavjetujte se s liječnikom.',
      },
    },
    {
      sku: 'DL-HONEY',
      price: 39.9,
      stock: 200,
      featured: true,
      popularity: 92,
      images: ['https://diblong.com/assets/images/honey/k1.webp'],
      titles: {
        sl: 'Diblong Power Honey',
        en: 'Diblong Power Honey',
        hr: 'Diblong Power Honey',
      },
      slugs: {
        sl: 'diblong-power-honey',
        en: 'diblong-power-honey',
        hr: 'diblong-power-honey',
      },
      short: {
        sl: 'Gosta medena tekstura z zeliščnim ozadjem — za počasne trenutke.',
        en: 'Rich honey texture with a herbal backdrop — for slow moments.',
        hr: 'Gusta medena tekstura s biljnim pozadinskim tonom — za sporije trenutke.',
      },
      long: {
        sl: '<p>Power Honey združuje sladkobo in globino okusa. Priporočamo uživanje v mirnem okolju, kjer lahko občutite teksturo in aromo brez hitenja.</p>',
        en: '<p>Power Honey combines sweetness and depth. Best enjoyed calmly, noticing texture and aroma.</p>',
        hr: '<p>Power Honey spaja slatkoću i dubinu. Najbolje uživati smireno, uz pažnju na teksturu i aromu.</p>',
      },
      usage: {
        sl: '1 žlička na priložnost. Ne segrevajte nad 40 °C.',
        en: 'One teaspoon per occasion. Do not heat above 40 °C.',
        hr: '1 žličica po prigodi. Ne zagrijavajte iznad 40 °C.',
      },
      disclaimer: {
        sl: 'Vsebuje med — ni primeren za alergike na cvetni prah.',
        en: 'Contains honey — not suitable for pollen allergy.',
        hr: 'Sadrži med — nije prikladno za alergiju na pelud.',
      },
    },
    {
      sku: 'DL-PASTE',
      price: 32.9,
      stock: 90,
      popularity: 70,
      titles: {
        sl: 'Diblong Herbal Paste',
        en: 'Diblong Herbal Paste',
        hr: 'Diblong biljna pasta',
      },
      slugs: {
        sl: 'diblong-zeliscna-pasta',
        en: 'diblong-herbal-paste',
        hr: 'diblong-biljna-pasta',
      },
      short: {
        sl: 'Kremasta pasta za ritual nanašanja in zaznavno bogatejšo teksturo.',
        en: 'Creamy paste for a tactile ritual and richer mouthfeel.',
        hr: 'Kremasta pasta za ritual nanošenja i bogatiju teksturu.',
      },
      long: {
        sl: '<p>Pasta oblika omogoča postopen nadzor količine. Zeliščni profil je zmeren, da ostane eleganten in ne vsiljiv.</p>',
        en: '<p>Paste format gives gradual control. Herbal profile stays moderate and refined.</p>',
        hr: '<p>Format paste omogućuje postepenu kontrolu količine. Biljni profil ostaje umjeren i elegantan.</p>',
      },
      usage: {
        sl: 'Nanesite z čisto žličko. Po uporabi zaprite posodo.',
        en: 'Apply with a clean spoon. Reseal after use.',
        hr: 'Nanesite čistom žličicom. Zatvorite nakon upotrebe.',
      },
      disclaimer: {
        sl: 'Hranite na suhem in hladnem mestu.',
        en: 'Store cool and dry.',
        hr: 'Čuvati suho i rashlađeno.',
      },
    },
    {
      sku: 'DL-BONBON',
      price: 18.9,
      stock: 300,
      bestseller: true,
      popularity: 95,
      images: [
        'https://diblong.com/assets/images/bonbon-yazi-yani.webp',
        'https://diblong.com/assets/images/bonbon/k1.webp',
      ],
      titles: { sl: 'Diblong Bonbon', en: 'Diblong Bonbon', hr: 'Diblong Bonbon' },
      slugs: { sl: 'diblong-bonbon', en: 'diblong-bonbon', hr: 'diblong-bonbon' },
      short: {
        sl: 'Elegantna sladica z zeliščnim jedrom — diskreten format.',
        en: 'An elegant confection with a herbal core — discreet format.',
        hr: 'Elegantan slatkiš s biljnim srcem — diskretan format.',
      },
      long: {
        sl: '<p>Bonbon združuje čokoladno tančico in noto, ki ostane subtilna. Priporočamo hranjenje pri sobni temperaturi stran od sončne svetlobe.</p>',
        en: '<p>Fine coating, subtle core notes. Store at room temperature away from direct light.</p>',
        hr: '<p>Fina obloga, suptilne note. Čuvati na sobnoj temperaturi izvan izravne svjetlosti.</p>',
      },
      usage: {
        sl: '1 kos na priložnost. Uživajte počasi.',
        en: 'One piece per occasion. Enjoy slowly.',
        hr: '1 komad po prigodi. Uživajte polako.',
      },
      disclaimer: {
        sl: 'Vsebuje sladkor in mlečne sestavine.',
        en: 'Contains sugar and dairy.',
        hr: 'Sadrži šećer i mliječne sastojke.',
      },
    },
    {
      sku: 'DL-CAPSULE',
      price: 28.9,
      stock: 250,
      popularity: 84,
      images: ['https://diblong.com/assets/images/kapsul-yazi-yani.webp'],
      titles: {
        sl: 'Diblong Herbal Capsule',
        en: 'Diblong Herbal Capsule',
        hr: 'Diblong biljne kapsule',
      },
      slugs: {
        sl: 'diblong-zeliscne-kapsule',
        en: 'diblong-herbal-capsules',
        hr: 'diblong-biljne-kapsule',
      },
      short: {
        sl: 'Kapsule za enostavno rutino — merljiva količina, premičen ton.',
        en: 'Capsules for a simple routine — measured, premium tone.',
        hr: 'Kapsule za jednostavnu rutinu — izmjerena količina, premium ton.',
      },
      long: {
        sl: '<p>Vsaka kapsula vsebuje skrbno izbrane surovine. Oblika je zasnovana za potovalno torbo in diskretno shranjevanje.</p>',
        en: '<p>Each capsule contains curated botanical inputs. Travel-friendly, discreet storage.</p>',
        hr: '<p>Svaka kapsula sadrži odabrane biljne ulaze. Prikladno za put i diskretno skladištenje.</p>',
      },
      usage: {
        sl: 'Sledite navodilu na etiketi. Ne presegajte priporočene dnevne količine.',
        en: 'Follow label directions. Do not exceed the recommended daily amount.',
        hr: 'Pridržavajte se uputa na etiketi. Ne prelazite preporučene dnevne količine.',
      },
      disclaimer: {
        sl: 'Prehransko dopolnilo.',
        en: 'Food supplement.',
        hr: 'Dodatak prehrani.',
      },
    },
    {
      sku: 'DL-LOKUM',
      price: 14.9,
      stock: 160,
      popularity: 62,
      titles: {
        sl: 'Diblong Turkish Delight Bar',
        en: 'Diblong Turkish Delight Bar',
        hr: 'Diblong rahat lokum štanglica',
      },
      slugs: {
        sl: 'diblong-rahat-lokum',
        en: 'diblong-turkish-delight-bar',
        hr: 'diblong-rahat-lokum',
      },
      short: {
        sl: 'Mehka štanglica z cvetnimi notami in zeliščnim pridihom.',
        en: 'Soft bar with floral notes and a herbal accent.',
        hr: 'Mekana štanglica s cvjetnim notama i biljnim naglaskom.',
      },
      long: {
        sl: '<p>Tekstura se topi počasi; primeren je za deljenje ali osebni užitek. Priporočamo skladiščenje v hladilniku po odprtju.</p>',
        en: '<p>Slow-melting texture — shareable or personal. Refrigerate after opening.</p>',
        hr: '<p>Sporo topljenje — za dijeljenje ili osobno. Hladiti nakon otvaranja.</p>',
      },
      usage: {
        sl: 'Po odprtju porabite v 7 dneh.',
        en: 'Consume within 7 days after opening.',
        hr: 'Potrošiti unutar 7 dana nakon otvaranja.',
      },
      disclaimer: {
        sl: 'Vsebuje oreščke (lahko sledi). Preverite etiketo.',
        en: 'May contain nuts. Check label.',
        hr: 'Može sadržavati orašaste plodove. Provjerite etiketu.',
      },
    },
    {
      sku: 'DL-CHOCO',
      price: 12.9,
      stock: 220,
      popularity: 78,
      titles: {
        sl: 'Diblong Chocolate',
        en: 'Diblong Chocolate',
        hr: 'Diblong čokolada',
      },
      slugs: {
        sl: 'diblong-cokolada',
        en: 'diblong-chocolate',
        hr: 'diblong-cokolada',
      },
      short: {
        sl: 'Temna čokolada z zeliščnim profilom — uravnotežen okus.',
        en: 'Dark chocolate with a balanced herbal profile.',
        hr: 'Tamna čokolada s uravnoteženim biljnim profilom.',
      },
      long: {
        sl: '<p>Kakavova intenzivnost in subtilna grenkoba ustvarjata zrelo doživetje. Idealno za večerni ritual.</p>',
        en: '<p>Cocoa intensity with subtle bitterness — a mature evening ritual.</p>',
        hr: '<p>Intenzivnost kakaa i suptilna gorkoća — zreli večernji ritual.</p>',
      },
      usage: {
        sl: '1–2 rezini na priložnost.',
        en: '1–2 pieces per occasion.',
        hr: '1–2 komada po prigodi.',
      },
      disclaimer: {
        sl: 'Vsebuje mleko in sojo.',
        en: 'Contains milk and soy.',
        hr: 'Sadrži mlijeko i soju.',
      },
    },
    {
      sku: 'DL-LADY-CHOCO',
      price: 12.9,
      stock: 210,
      popularity: 76,
      titles: {
        sl: 'Diblong Lady Chocolate',
        en: 'Diblong Lady Chocolate',
        hr: 'Diblong Lady čokolada',
      },
      slugs: {
        sl: 'diblong-lady-cokolada',
        en: 'diblong-lady-chocolate',
        hr: 'diblong-lady-cokolada',
      },
      short: {
        sl: 'Mehkejša nota in elegantnejša sladkoba — oblikovano za subtilnejši okus.',
        en: 'Softer notes and elegant sweetness — refined taste.',
        hr: 'Mekše note i elegantnija slatkoća — profinjeniji okus.',
      },
      long: {
        sl: '<p>Lady linija poudarja zračnejšo teksturo in cvetne pridihe, obvladano z zeliščnim ozadjem.</p>',
        en: '<p>Lady line emphasizes airy texture and floral hints with a controlled herbal backdrop.</p>',
        hr: '<p>Lady linija naglašava zračniju teksturu i cvjetne tragove uz kontrolirano biljno pozadinu.</p>',
      },
      usage: {
        sl: '1–2 rezini na priložnost.',
        en: '1–2 pieces per occasion.',
        hr: '1–2 komada po prigodi.',
      },
      disclaimer: {
        sl: 'Vsebuje mleko in sojo.',
        en: 'Contains milk and soy.',
        hr: 'Sadrži mlijeko i soju.',
      },
    },
    {
      sku: 'DL-COFFEE',
      price: 22.9,
      stock: 180,
      popularity: 86,
      images: ['https://diblong.com/assets/images/kahve-yazi-yani.webp'],
      titles: { sl: 'Diblong Coffee', en: 'Diblong Coffee', hr: 'Diblong kava' },
      slugs: {
        sl: 'diblong-kava',
        en: 'diblong-coffee',
        hr: 'diblong-kava',
      },
      short: {
        sl: 'Mešanica za pripravo aromatične kave z zeliščnim pridihom.',
        en: 'A blend for aromatic coffee with a herbal accent.',
        hr: 'Mješavina za aromatičnu kavu s biljnim naglaskom.',
      },
      long: {
        sl: '<p>Zrnato ravnovesje grenkobe in topline. Priporočamo pripravo z drip ali french press za čistejši okus.</p>',
        en: '<p>Balanced bitterness and warmth. Drip or French press recommended.</p>',
        hr: '<p>Uravnotežena gorkoća i toplina. Preporuka: drip ili french press.</p>',
      },
      usage: {
        sl: '10 g na skodelico (180 ml), voda 92–96 °C.',
        en: '10 g per cup (180 ml), water 92–96 °C.',
        hr: '10 g po šalici (180 ml), voda 92–96 °C.',
      },
      disclaimer: {
        sl: 'Vsebuje kofein.',
        en: 'Contains caffeine.',
        hr: 'Sadrži kofein.',
      },
    },
    {
      sku: 'DL-TOWEL',
      price: 24.9,
      stock: 140,
      popularity: 68,
      images: ['https://diblong.com/assets/images/upl/mendilmanset.png'],
      titles: { sl: 'Diblong Towel', en: 'Diblong Towel', hr: 'Diblong ručnik' },
      slugs: {
        sl: 'diblong-brisaca',
        en: 'diblong-towel',
        hr: 'diblong-rucnik',
      },
      short: {
        sl: 'Mehka, vpojna brisača — premičen dodatek k ritualu nege.',
        en: 'Soft, absorbent towel — a premium care accessory.',
        hr: 'Mekan, upijajući ručnik — premium dodatak ritualu njege.',
      },
      long: {
        sl: '<p>Visoka gostota vlaken za prijeten dotik. Primerna za potovanja in domače wellness kotičke.</p>',
        en: '<p>High fiber density for a pleasant touch. Travel-friendly.</p>',
        hr: '<p>Visoka gustoća vlakana za ugodan dodir. Prikladno za putovanja.</p>',
      },
      usage: {
        sl: 'Perte na 40 °C z blagim detergentom.',
        en: 'Machine wash 40 °C with mild detergent.',
        hr: 'Prati na 40 °C s blagim deterdžentom.',
      },
      disclaimer: {
        sl: 'Barva se lahko ob pranju rahlo spremeni.',
        en: 'Color may shift slightly with washing.',
        hr: 'Boja se može blago promijeniti pranjem.',
      },
    },
    {
      sku: 'DL-SPRAY',
      price: 29.9,
      stock: 190,
      popularity: 90,
      images: ['https://diblong.com/assets/images/upl/spreymanset.png'],
      titles: { sl: 'Diblong Spray', en: 'Diblong Spray', hr: 'Diblong sprej' },
      slugs: {
        sl: 'diblong-sprej',
        en: 'diblong-spray',
        hr: 'diblong-sprej',
      },
      short: {
        sl: 'Razpršilo za hitro osvežitev in jasno, zračno noto.',
        en: 'A mist for quick refresh with a clear, airy note.',
        hr: 'Sprej za brzo osvježenje s jasnom, zračnom notom.',
      },
      long: {
        sl: '<p>Formula je zasnovana za tanko plast in enakomerno porazdelitev. Izogibajte se stiku z očmi.</p>',
        en: '<p>Fine mist, even distribution. Avoid eye contact.</p>',
        hr: '<p>Fina magla, ravnomjerna raspodjela. Izbjegavajte kontakt s očima.</p>',
      },
      usage: {
        sl: 'Zadržite 20–30 cm od kože. 1–2 pritiska zadoščata.',
        en: 'Hold 20–30 cm from skin. 1–2 pumps.',
        hr: 'Držite 20–30 cm od kože. 1–2 pritiska.',
      },
      disclaimer: {
        sl: 'Testirajte na manjši površini pred prvo uporabo.',
        en: 'Patch test before first use.',
        hr: 'Testirajte na malom području prije prve uporabe.',
      },
    },
    {
      sku: 'DL-JELLY',
      price: 16.9,
      stock: 260,
      popularity: 82,
      images: ['https://diblong.com/assets/images/jel-yazi-yani.webp'],
      titles: { sl: 'Diblong Jelly', en: 'Diblong Jelly', hr: 'Diblong žele' },
      slugs: { sl: 'diblong-zele', en: 'diblong-jelly', hr: 'diblong-zele' },
      short: {
        sl: 'Žele tekstura z elegantnim sijajem in zmerno sladkobo.',
        en: 'Gel texture with elegant gloss and moderate sweetness.',
        hr: 'Žele tekstura s elegantnim sjajem i umjerenom slatkoćom.',
      },
      long: {
        sl: '<p>Jelly oblika omogoča igrivo serviranje. Shranjujte hladno po odprtju.</p>',
        en: '<p>Playful serving format. Refrigerate after opening.</p>',
        hr: '<p>Igrativ format posluživanja. Hladiti nakon otvaranja.</p>',
      },
      usage: {
        sl: '1 porcija na priložnost.',
        en: 'One serving per occasion.',
        hr: 'Jedna porcija po prigodi.',
      },
      disclaimer: {
        sl: 'Vsebuje sladkor in želatino.',
        en: 'Contains sugar and gelatin.',
        hr: 'Sadrži šećer i želatinu.',
      },
    },
    {
      sku: 'DL-CONDOM',
      price: 14.9,
      stock: 500,
      popularity: 96,
      images: ['https://diblong.com/assets/images/YAKIN-TEMAS-3.jpg'],
      titles: {
        sl: 'Diblong Condom',
        en: 'Diblong Condom',
        hr: 'Diblong kondom',
      },
      slugs: {
        sl: 'diblong-kondom',
        en: 'diblong-condom',
        hr: 'diblong-kondom',
      },
      short: {
        sl: 'Diskreten zaščitni izdelek v premični izvedbi.',
        en: 'A discreet protective product in a premium execution.',
        hr: 'Diskretan zaštitni proizvod u premium izvedbi.',
      },
      long: {
        sl: '<p>Izdelan za zanesljivost in udobje. Pakiranje je nevpadljivo, etiketa jasna in informativna.</p>',
        en: '<p>Designed for reliability and comfort. Neutral outer packaging.</p>',
        hr: '<p>Dizajnirano za pouzdanost i udobnost. Neutralno vanjsko pakiranje.</p>',
      },
      usage: {
        sl: 'Upoštevajte navodila proizvajalca na embalaži.',
        en: 'Follow manufacturer instructions on the box.',
        hr: 'Pridržavajte se uputa proizvođača na kutiji.',
      },
      disclaimer: {
        sl: 'Medicinski pripomoček / CE (vzorec). Preverite rok uporabe.',
        en: 'Medical device / CE (sample). Check expiry.',
        hr: 'Medicinski proizvod / CE (uzorak). Provjerite rok.',
      },
    },
  ];

  const createdProducts: { id: string; sku: string }[] = [];
  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { sku: p.sku } });
    if (existing) {
      createdProducts.push({ id: existing.id, sku: p.sku });
      continue;
    }
    const prod = await prisma.product.create({
      data: {
        sku: p.sku,
        price: p.price,
        stock: p.stock,
        isFeatured: !!p.featured,
        isBestseller: !!p.bestseller,
        popularity: p.popularity ?? 50,
        categoryId: cat.id,
        translations: {
          create: [
            {
              locale: 'sl',
              title: p.titles.sl,
              slug: p.slugs.sl,
              shortDescription: p.short.sl,
              longDescription: p.long.sl,
              usageNotes: p.usage.sl,
              disclaimer: p.disclaimer.sl,
              faqJson: p.faq ? faqJson(p.faq) : null,
              metaTitle: `${p.titles.sl} | Diblong`,
              metaDescription: p.short.sl,
              ogTitle: p.titles.sl,
              ogDescription: p.short.sl,
              ogImageUrl: p.images?.[0] ?? null,
              canonicalPath: `/sl/izdelek/${p.slugs.sl}`,
            },
            {
              locale: 'en',
              title: p.titles.en,
              slug: p.slugs.en,
              shortDescription: p.short.en,
              longDescription: p.long.en,
              usageNotes: p.usage.en,
              disclaimer: p.disclaimer.en,
              faqJson: p.faq ? faqJson(p.faq) : null,
              metaTitle: `${p.titles.en} | Diblong`,
              metaDescription: p.short.en,
              ogTitle: p.titles.en,
              ogDescription: p.short.en,
              ogImageUrl: p.images?.[0] ?? null,
              canonicalPath: `/en/product/${p.slugs.en}`,
            },
            {
              locale: 'hr',
              title: p.titles.hr,
              slug: p.slugs.hr,
              shortDescription: p.short.hr,
              longDescription: p.long.hr,
              usageNotes: p.usage.hr,
              disclaimer: p.disclaimer.hr,
              faqJson: p.faq ? faqJson(p.faq) : null,
              metaTitle: `${p.titles.hr} | Diblong`,
              metaDescription: p.short.hr,
              ogTitle: p.titles.hr,
              ogDescription: p.short.hr,
              ogImageUrl: p.images?.[0] ?? null,
              canonicalPath: `/hr/proizvod/${p.slugs.hr}`,
            },
          ],
        },
      },
    });
    createdProducts.push({ id: prod.id, sku: p.sku });

    let order = 0;
    for (const url of p.images ?? []) {
      const meta = await downloadMedia(url, p.sku.toLowerCase());
      const media = await prisma.mediaAsset.create({
        data: {
          sourceUrl: meta.sourceUrl,
          storedPath: meta.storedPath,
          mimeType: meta.mimeType,
          fileName: meta.fileName,
        },
      });
      await prisma.productImage.create({
        data: {
          productId: prod.id,
          mediaAssetId: media.id,
          sortOrder: order++,
        },
      });
    }

    if (!p.images?.length) {
      const ph = mediaMap['placeholder'];
      if (ph) {
        await prisma.productImage.create({
          data: {
            productId: prod.id,
            mediaAssetId: ph,
            sortOrder: 0,
          },
        });
      }
    }
  }

  const shot = createdProducts.find((x) => x.sku === 'DL-SHOT');
  const honey = createdProducts.find((x) => x.sku === 'DL-HONEY');
  const bonbon = createdProducts.find((x) => x.sku === 'DL-BONBON');
  if (shot && honey) {
    await prisma.productRelation.createMany({
      data: [{ fromProductId: shot.id, toProductId: honey.id }],
      skipDuplicates: true,
    });
  }
  if (bonbon && honey) {
    await prisma.productRelation.createMany({
      data: [{ fromProductId: bonbon.id, toProductId: honey.id }],
      skipDuplicates: true,
    });
  }

  await prisma.promoBanner.upsert({
    where: { id: 'promo-hero-main' },
    update: { sortOrder: 1, isActive: true, linkUrl: '/sl/trgovina' },
    create: {
      id: 'promo-hero-main',
      sortOrder: 1,
      isActive: true,
      linkUrl: '/sl/trgovina',
      translations: {
        create: [
          {
            locale: 'sl',
            headline: 'Diblong — intimno dobro počutje, elegantno oblikovano',
            subline: 'Odkrijte izbrane izdelke z zeliščnim izvornim jezikom znamke.',
            ctaLabel: 'V trgovino',
            ctaPath: '/sl/trgovina',
          },
          {
            locale: 'en',
            headline: 'Diblong — intimate wellness, elegantly composed',
            subline: 'Discover curated herbal expressions of the brand.',
            ctaLabel: 'Shop the line',
            ctaPath: '/en/shop',
          },
          {
            locale: 'hr',
            headline: 'Diblong — intimna dobrobit, elegantno oblikovana',
            subline: 'Otkrijte odabrane biljne izraze brenda.',
            ctaLabel: 'U trgovinu',
            ctaPath: '/hr/trgovina',
          },
        ],
      },
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: 'storefront' },
    update: {
      value: {
        defaultLocale: 'sl',
        brandName: 'Diblong',
        supportEmail: 'support@diblong.com',
      },
    },
    create: {
      key: 'storefront',
      value: {
        defaultLocale: 'sl',
        brandName: 'Diblong',
        supportEmail: 'support@diblong.com',
      },
    },
  });
}

async function seedDemoOrder(adminUserId: string) {
  const existing = await prisma.order.count();
  if (existing > 0) return;
  const product = await prisma.product.findFirst({ where: { sku: 'DL-SHOT' } });
  if (!product) return;
  const tr = await prisma.productTranslation.findFirst({
    where: { productId: product.id, locale: 'sl' },
  });
  await prisma.order.create({
    data: {
      userId: adminUserId,
      status: OrderStatus.DELIVERED,
      countryCode: 'SI',
      subtotal: 27.6,
      shippingTotal: 4.9,
      total: 32.5,
      items: {
        create: [
          {
            productId: product.id,
            titleSnapshot: tr?.title ?? 'Diblong Shot',
            unitPrice: 6.9,
            qty: 4,
          },
        ],
      },
    },
  });
}

async function main() {
  await seedRoles();
  const admin = await seedAdmin();
  await seedShipping();
  await seedPages();

  const placeholderSvg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500" viewBox="0 0 1200 1500">
      <defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#1a1510"/><stop offset="100%" stop-color="#2a2218"/>
      </linearGradient></defs>
      <rect width="1200" height="1500" fill="url(#g)"/>
      <text x="50%" y="50%" fill="#c9a962" font-family="Georgia,serif" font-size="42" text-anchor="middle">Diblong</text>
    </svg>`,
    'utf-8',
  );
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  const phName = `placeholder-${randomUUID().slice(0, 8)}.svg`;
  const phPath = path.join(uploadsDir, phName);
  fs.writeFileSync(phPath, placeholderSvg);
  const placeholderMedia = await prisma.mediaAsset.create({
    data: {
      storedPath: `/uploads/${phName}`,
      mimeType: 'image/svg+xml',
      fileName: phName,
    },
  });
  const mediaMap = { placeholder: placeholderMedia.id };

  await seedCatalog(mediaMap);
  await seedDemoOrder(admin.id);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
