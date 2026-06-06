/**
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  FAKE GOOGLE DRIVE — DOCUMENT STORE                                        │
 * │  This is the ONE file to edit. Paste a document's plain text into `text`   │
 * │  and add an entry below; it shows up as a virtual file in the picker and   │
 * │  imports with that text as its content. Everything else (id, size, date)   │
 * │  is derived automatically — name + kind + text is all you need.            │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * SCOPE: the shared drive of a fictional Dutch social-work organisation —
 * "Sociaal Wijkteam Haarlem-Oost" — that we're helping improve by putting
 * structured trainings in place. The corpus = the material a training lead would
 * actually pull from: the improvement case, the methodologies to train
 * (Movisie methodieken), the team, the current way of working, a quality audit,
 * and the training plan. Generated trainings are grounded in these.
 *
 * kind: "doc" (Google Docs) | "sheet" | "slides" | "pdf" | "image"
 * Optional flags: starred, shared, owner (defaults to "you"), modified (ISO).
 */

export type DriveKind = "doc" | "sheet" | "slides" | "pdf" | "image";

export type RawDoc = {
  name: string;
  kind: DriveKind;
  owner?: string;
  starred?: boolean;
  shared?: boolean;
  /** ISO date; if omitted a recent date is derived from position. */
  modified?: string;
  /** The document's full plain text — paste it here. */
  text: string;
};

export const FAKE_DOCS: RawDoc[] = [
  {
    name: "Wijkteam Haarlem-Oost — Verbeterplan 2026.gdoc",
    kind: "doc",
    owner: "L. Mulder (teamleider)",
    starred: true,
    shared: true,
    text: `Sociaal Wijkteam Haarlem-Oost — Verbeterplan 2026

Wie we zijn: een wijkteam van 14 sociaal werkers dat inwoners ondersteunt bij
schulden, opvoeding, eenzaamheid, mantelzorg en toegang tot voorzieningen.

Aanleiding voor verbetering:
- Hoge caseload en veel wisselingen; nieuwe collega's stromen continu in.
- Methodisch werken is inconsistent — iedereen doet het "op eigen manier".
- Intakes verschillen sterk in kwaliteit; doelen worden vaak vaag geformuleerd.
- Besluiten over op- en afschalen zijn moeilijk navolgbaar in het dossier.

Doelen 2026:
1. Eén gedeelde methodische basis (oplossingsgericht + krachtgericht werken).
2. Elke intake levert een concreet, navolgbaar plan met meetbare doelen op.
3. Veiligheidsinschattingen volgens Signs of Safety, uniform vastgelegd.
4. Besluitvorming transparant en onderbouwd (Betere Besluiten).

Aanpak: een reeks korte, praktische trainingen voor het hele team, met
oefeningen op echte casuïstiek en borging in de dagelijkse werkwijze.`,
  },
  {
    name: "Oplossingsgericht werken — methodebeschrijving (Movisie).pdf",
    kind: "pdf",
    owner: "Movisie",
    shared: true,
    text: `Methodebeschrijving Oplossingsgericht werken in het sociaal werk (samenvatting)

Uitgangspunt: richt je op wat de cliënt wél wil bereiken en op aanwezige krachten,
niet op het uitdiepen van problemen. De cliënt is expert over het eigen leven.

Kerntechnieken:
- De wondervraag: "Stel dat het probleem vannacht is opgelost — waaraan merk je dat?"
- Schaalvragen: "Op een schaal van 0–10, waar sta je nu? Wat maakt dat het geen 0 is?"
- Uitzonderingen zoeken: momenten waarop het probleem er minder of niet was.
- Complimenten en kleine, haalbare vervolgstappen.

Toepassing in intake: doel concreet en in eigen woorden van de cliënt formuleren,
één eerstvolgende stap afspreken, voortgang met de schaalvraag volgen.`,
  },
  {
    name: "Krachtwerk — interventiebeschrijving (Movisie).pdf",
    kind: "pdf",
    owner: "Movisie",
    shared: true,
    text: `Interventiebeschrijving Krachtwerk (samenvatting)

Krachtwerk is een krachtgerichte basismethodiek voor het sociaal werk, gericht op
herstel en participatie van mensen in kwetsbare situaties (o.a. dak- en
thuisloosheid, multiproblematiek) — NIET specifiek voor één doelgroep.

Kernprincipes:
- Iedereen heeft krachten en kan groeien; de omgeving biedt hulpbronnen.
- De cliënt bepaalt eigen doelen; de werker werkt samen, niet over.
- Werken vanuit de eigen leefwereld en het netwerk van de cliënt.

Instrumenten: krachteninventarisatie en een doelenplan dat de cliënt mede-eigenaar maakt.
Let op (veelgemaakte fout): Krachtwerk is breed inzetbaar — niet verwarren met een
methode "alleen voor verstandelijke beperking".`,
  },
  {
    name: "Signs of Safety — methodebeschrijving (Movisie).pdf",
    kind: "pdf",
    owner: "Movisie",
    shared: true,
    text: `Methodebeschrijving Signs of Safety (samenvatting)

Veiligheidsgericht, oplossingsgericht kader voor werken met gezinnen waar zorgen
over veiligheid van kinderen spelen. Werkt samen met het gezin en het netwerk.

Drie kernvragen:
1. Waar maken we ons zorgen over? (zorgen / schade in het verleden)
2. Wat gaat er goed? (krachten en bestaande veiligheid)
3. Wat moet er gebeuren? (concrete veiligheidsdoelen en -afspraken)

Hulpmiddelen: de veiligheidsschaal (0–10) en het in begrijpelijke taal vastleggen
van zorgen, krachten en afspraken samen met het gezin.`,
  },
  {
    name: "Team & methodiek-status — Wijkteam Oost.gsheet",
    kind: "sheet",
    owner: "L. Mulder (teamleider)",
    text: `Naam, Rol, Jaren ervaring, Oplossingsgericht, Krachtwerk, Signs of Safety
F. el Amrani, Sociaal werker, 1, nee, nee, nee
S. de Boer, Sociaal werker, 3, basis, nee, basis
A. Visser, Sociaal werker (jeugd), 6, ja, basis, ja
M. Petrova, Sociaal werker, 2, basis, nee, nee
J. Willemsen, Senior / aandachtsfunctionaris, 9, ja, ja, ja

Conclusie: veel nieuwe collega's zonder methodische basis; grootste hiaat is
oplossingsgericht werken en uniform veiligheid inschatten.`,
  },
  {
    name: "Huidige werkwijze — Intake & dossier.gdoc",
    kind: "doc",
    owner: "S. de Boer",
    text: `Huidige werkwijze intake (zoals nu gedaan)

1. Aanmelding via wijkloket of verwijzer.
2. Kennismakingsgesprek (60 min), vrij van vorm — verschilt per collega.
3. Werker noteert situatie in het dossier; doelen vaak in eigen woorden van de werker.
4. Vervolgafspraken naar inschatting werker.

Knelpunten die collega's noemen:
- Geen gedeelde gespreksstructuur; nieuwe collega's "vinden het zelf uit".
- Doelen te vaag ("meer rust", "stabiliteit") en niet meetbaar.
- Eerstvolgende stap vaak niet concreet afgesproken.
- Veiligheid wordt soms impliciet ingeschat, niet vastgelegd.`,
  },
  {
    name: "Kwaliteitsaudit dossiers — Q2 2026.gdoc",
    kind: "doc",
    owner: "Kwaliteit & Beleid",
    shared: true,
    text: `Interne kwaliteitsaudit — steekproef 40 dossiers (Q2 2026)

Bevindingen:
- 62% van de doelen is niet meetbaar geformuleerd (geen schaal, geen termijn).
- In 45% ontbreekt een concrete eerstvolgende stap na de intake.
- Veiligheidsinschatting expliciet vastgelegd in slechts 30% van de jeugdcasussen.
- Onderbouwing van op-/afschalen vaak afwezig; besluit niet navolgbaar.
- Grote variatie tussen werkers — sterk afhankelijk van wie de intake deed.

Aanbevelingen: train oplossingsgericht doelen stellen (wonder-/schaalvraag),
uniforme Signs of Safety-inschatting, en navolgbare besluitvorming.`,
  },
  {
    name: "Betere besluiten in het sociaal werk — samenvatting (Movisie).pdf",
    kind: "pdf",
    owner: "Movisie",
    shared: true,
    text: `Betere besluiten in het sociaal werk (samenvatting)

Besluiten (op-/afschalen, melden, doorverwijzen) zijn vaak intuïtief. Kwaliteit
verbetert door het besluit expliciet en navolgbaar te maken.

Stappen:
1. Wat is de beslissing en wie neemt hem?
2. Welke informatie heb ik — en wat ontbreekt of is onzeker?
3. Welke opties zijn er, met voor- en nadelen?
4. Welke aannames maak ik; wat zegt het netwerk/de cliënt?
5. Leg besluit én onderbouwing kort vast in het dossier.

Valkuilen: bevestigingsbias, tijdsdruk, en "we doen het altijd zo".`,
  },
  {
    name: "Trainingsbehoefte & jaarplan — Wijkteam Oost.gslides",
    kind: "slides",
    owner: "L. Mulder (teamleider)",
    starred: true,
    text: `Trainingsplan 2026 — Wijkteam Haarlem-Oost (overzicht)

Prioriteiten (uit verbeterplan + audit):
1. Oplossingsgericht intakegesprek — doelen concreet en meetbaar maken. (hoog)
2. Krachtgericht werken met het netwerk van de cliënt. (midden)
3. Signs of Safety — uniform veiligheid inschatten en vastleggen. (hoog, jeugd)
4. Betere, navolgbare besluiten in het dossier. (midden)

Doelgroep: hele team; nieuwe collega's eerst. Voorkeur: korte sessies (90–180 min),
veel oefenen op echte (geanonimiseerde) casuïstiek, met een werkbare checklist mee.`,
  },
];
