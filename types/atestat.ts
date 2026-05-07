// ─── Simplified form data stored in sessionStorage ─────────────────────────

export interface SimpleFormData {
  student_name: string
  clasa: string
  profesor_coordonator: string
  liceu: string
  specializare: string
  tema: string
  firma_nume: string
  firma_forma_juridica: string
  firma_domeniu: string
  extra_info?: string
  emblema_base64?: string
  an: string
}

// ─── Input ─────────────────────────────────────────────────────────────────

export interface FirmaData {
  nume: string
  forma_juridica: string
  cif: string
  rc: string
  caen_cod: string
  caen_desc: string
  domeniu: string
  adresa: string
  telefon: string
  email: string
  iban: string
  banca: string
  an_infiintare: string
  angajati: number
  produse_servicii: string[]
  clienti_principali?: string[]
}

export interface AtestateInput {
  student_name: string
  clasa: string
  profesor_coordonator: string
  liceu: string
  specializare: string
  tema: string
  firma: FirmaData
  an: string
  emblema_base64?: string
  extra_info?: string
}

// ─── Content JSON returned by Claude ───────────────────────────────────────

export interface ContentMeta {
  filename: string
  topic_accounts_used: string[]
  period: string
  chapters_generated: string[]
}

export interface ContentTable {
  headers: string[]
  rows: string[][]
}

export interface Cap1Sectiune {
  id: string
  titlu: string
  paragraphs: string[]
  tables?: ContentTable[]
  items?: string[]
}

export interface Cap2Sectiune {
  id: string
  titlu: string
  paragraphs: string[]
  items?: string[]
  tables?: ContentTable[]
}

export interface SagaContent {
  paragraphs: string[]
  module: string[]
  avantaje: string[]
}

export interface InregistrareSimple {
  nr: number
  titlu: string
  tip: 'simpla'
  cont_d: string
  denumire_d: string
  explicatie_d: string
  cont_c: string
  denumire_c: string
  explicatie_c: string
  suma: number
}

export interface SubcontCompus {
  cont: string
  denumire: string
  explicatie?: string
  suma: number
}

export interface InregistrareCompusaD {
  nr: number
  titlu: string
  tip: 'compusa_d'
  conturi_d: SubcontCompus[]
  cont_c: string
  denumire_c: string
  explicatie_c: string
  suma_totala: number
}

export interface InregistrareCompusaC {
  nr: number
  titlu: string
  tip: 'compusa_c'
  cont_d: string
  denumire_d: string
  explicatie_d: string
  conturi_c: SubcontCompus[]
  suma_totala: number
}

export type Inregistrare = InregistrareSimple | InregistrareCompusaD | InregistrareCompusaC

export interface Cap3Content {
  saga: SagaContent
  intro_paragraph: string
  inregistrari: Inregistrare[]
}

export interface SwotContent {
  puncte_tari: string[]
  puncte_slabe: string[]
  oportunitati: string[]
  amenintari: string[]
}

export interface AnalizaPieteiContent {
  paragraphs: string[]
  piete_tinta: string[]
  concurenti: {
    internationali: string
    locali_mari: string
    mici_startup: string
  }
  obiective_economice: string[]
  obiective_psihologice: string[]
  swot: SwotContent
}

export interface PoliticaMarketing {
  paragraphs: string[]
  linii?: { linie: string; detalii: string[] }[]
  strategii?: string[]
  canale?: string[]
  instrumente?: string[]
}

export interface MarketingContent {
  produs: PoliticaMarketing
  pret: PoliticaMarketing
  distributie: PoliticaMarketing
  promovare: PoliticaMarketing
  strategii_firma: string[]
}

export interface NegociereContent {
  paragraphs: string[]
  stiluri: string[]
  tehnici_paragraphs: string[]
  pregatire: string[]
  tehnici: string[]
  aplicare_tema: string[]
}

export interface Cap4Content {
  analiza_pietei: AnalizaPieteiContent
  marketing: MarketingContent
  negociere: NegociereContent
}

// ─── Annexes ────────────────────────────────────────────────────────────────

export interface DocumentField {
  label: string
  value: string
}

export interface RegistruJurnalRow {
  nr: number
  data: string
  document: string
  explicatie: string
  simbol_d: string
  simbol_c: string
  suma: number
}

export interface ContTEntry {
  explicatie: string
  suma: number
}

export interface BalantaRow {
  simbol: string
  denumire: string
  sold_initial_d: number
  sold_initial_c: number
  rulaj_d: number
  rulaj_c: number
  sold_final_d: number
  sold_final_c: number
}

export interface Anexa {
  nr: number
  titlu: string
  descriere: string
  tip: 'table' | 'document' | 'registru_jurnal' | 'cont_t' | 'balanta'
  table?: ContentTable
  fields?: DocumentField[]
  rows?: RegistruJurnalRow[]
  cont?: string
  denumire_cont?: string
  debit?: ContTEntry[]
  credit?: ContTEntry[]
  balanta_rows?: BalantaRow[]
}

// ─── Full content response ──────────────────────────────────────────────────

export interface AtestateContent {
  status: 'success'
  meta: ContentMeta
  argument: { paragraphs: string[] }
  cap1: { sectiuni: Cap1Sectiune[] }
  cap2: { sectiuni: Cap2Sectiune[] }
  cap3: Cap3Content
  cap4: Cap4Content
  concluzii: { paragraphs: string[] }
  bibliografie: { items: string[] }
  anexe: Anexa[]
}

export interface AtestateError {
  status: 'error'
  message: string
}

export type AtestateResponse = AtestateContent | AtestateError
