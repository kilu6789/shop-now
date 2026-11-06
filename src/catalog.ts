export const categories = [
  [
    "produce",
    "Voće i povrće",
    "Voće i povrće",
    "Banane,Jabuke,Naranče,Limun,Rajčice,Krastavci,Paprika,Krumpir,Luk,Mrkva,Zelena salata",
  ],
  [
    "dairy",
    "Mliječno i jaja",
    "Mliječni proizvodi i jaja",
    "Mlijeko,Jaja,Jogurt,Grčki jogurt,Svježi sir,Tvrdi sir,Maslac,Vrhnje",
  ],
  [
    "meat",
    "Meso i riba",
    "Meso i riba",
    "Piletina,Puretina,Mljeveno meso,Losos,Tuna",
  ],
  ["bakery", "Pekarnica", "Pekarnica", "Kruh,Pecivo,Tost,Tortilje"],
  [
    "grains",
    "Žitarice i tjestenina",
    "Žitarice, tjestenina i riža",
    "Riža,Tjestenina,Zobene pahuljice,Brašno,Palenta",
  ],
  [
    "pantry",
    "Iz smočnice",
    "Konzervirana i pakirana hrana",
    "Grah,Slanutak,Kukuruz,Pasirana rajčica,Maslinovo ulje,Sol,Šećer",
  ],
  ["drinks", "Pića", "Pića", "Voda,Mineralna voda,Sok,Kava,Čaj"],
  [
    "snacks",
    "Slatko i slano",
    "Slatkiši i grickalice",
    "Čokolada,Keksi,Čips,Orašasti plodovi",
  ],
  [
    "frozen",
    "Smrznuto",
    "Smrznuta hrana",
    "Smrznuti grašak,Smrznuto povrće,Sladoled",
  ],
  [
    "hygiene",
    "Higijena",
    "Higijena",
    "Pasta za zube,Šampon,Gel za tuširanje,Sapun",
  ],
  [
    "home",
    "Kućanstvo",
    "Kućanstvo",
    "Toaletni papir,Papirnati ručnici,Deterdžent za rublje,Deterdžent za suđe,Vrećice za smeće",
  ],
  ["other", "Ostalo", "Ostalo", "Hrana za ljubimce,Baterije"],
].map(([id, short, name, items]) => ({
  id,
  short,
  name,
  items: items.split(","),
}));
export type Product = {
  id: string;
  name: string;
  category: string;
  custom: boolean;
};
export const catalog: Product[] = categories.flatMap((c) =>
  c.items.map((name, i) => ({
    id: `${c.id}-${i}`,
    name,
    category: c.id,
    custom: false,
  })),
);
export const popular = [
  "Mlijeko",
  "Jaja",
  "Banane",
  "Kruh",
  "Grčki jogurt",
  "Piletina",
  "Riža",
  "Tvrdi sir",
];
