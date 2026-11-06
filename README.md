# Naša lista

Mobilna shopping lista u žuto-crnom cartoon stilu. React, TypeScript i Vite.

## Trenutna faza

Prva testabilna cjelina: lista grupirana po kategorijama, katalog, često kupovano,
pretraživanje bez dijakritika, vlastiti proizvodi, označavanje kupljenog i poništavanje
čišćenja. Podaci se spremaju u localStorage **samo u ovom pregledniku**.
Nema autentifikacije ni sinkronizacije između uređaja. To nije završena verzija 1.0.

Katalog ima 12 kategorija. Vlastiti proizvod na listi prvo treba ukloniti s liste
prije brisanja iz kataloga. Učestalost raste kad se proizvod ponovno doda nakon
uklanjanja; označavanje kupljenog i vraćanje ne povećava broj.

## Pokretanje

Node.js 24 (testirano: 24.19.0), npm 11.

```sh
cd /workspace/shop-now
npm ci
npm run dev -- --port 5173
```

## Provjere

```sh
npm test
npm run build
npm run test:e2e
```

Browser testovi koriste Chromium na `/usr/bin/chromium`. Ako je preglednik drugdje,
postaviti `PLAYWRIGHT_CHROMIUM_PATH` na njegovu izvršnu datoteku. Playwright sam
pokreće Vite ako poslužitelj već ne radi. Testovi provjeravaju mobilni prikaz u
Chromiumu; ne zamjenjuju provjeru na fizičkom Samsungu i iPhoneu.

## Ručno isprobavanje

1. Odaberi „Dodaj namirnice”, dodaj mlijeko, jaja i banane, pa „Gotovo”.
2. Dodirni mlijeko: prelazi u „Kupljeno”. Ponovni dodir vraća ga.
3. Osvježi preglednik: lista ostaje spremljena.
4. Pretraži „secer”: pronaći će „Šećer”.
5. Upiši „Proteinsko pecivo”, odaberi novu namirnicu i kategoriju Pekarnica.
6. U katalogu uz vlastitu namirnicu odaberi uređivanje.
7. „Očisti” uklanja kupljeno, a „Poništi” vraća uklonjeno dok ne napraviš novu promjenu.

## Sljedeća cjelina

Supabase: dva računa, kućanstvo, kontrola pristupa na razini redaka, jedinstven
proizvod po listi i sinkronizacija pojedinačnih promjena. Zatim PWA manifest,
service worker i ikone za instalaciju, HTTPS hosting i provjera na oba mobitela.
Supabase projekt još nije konfiguriran. Ne unositi lozinke ili privatne ključeve u
repozitorij. U ovoj fazi aplikacija ne šalje podatke van preglednika.

## Poveznica za probu na mobitelu (Netlify Drop)

1. Pokreni `npm run build` i zapakiraj **sadržaj** mape `dist` u ZIP
   (`index.html` treba biti u korijenu ZIP-a).
2. Otvori https://app.netlify.com/drop, prijavi se besplatnim računom ako se traži
   i prenesi ZIP ili raspakiranu mapu `dist`.
3. Kopiraj dodijeljenu HTTPS poveznicu i otvori je u Chromeu na Samsungu ili
   Safariju na iPhoneu. Koristi besplatni plan; nije potrebna domena.

Ovo je javno dostupan prikaz aplikacije. Lista se zasad sprema samo u pregledniku
svakog posjetitelja; aplikacija je ne šalje hostingu niti dijeli s drugim uređajem.
Ovo još nije instalabilna PWA verzija. Objava okruženja u Codexu ne objavljuje web.
Nakon promjene koda potrebno je ponovno izgraditi i prenijeti `dist`.
