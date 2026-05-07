import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Packer,
  AlignmentType,
  WidthType,
  BorderStyle,
  Footer,
  PageNumber,
  NumberFormat,
  Tab,
  TabStopType,
  TabStopPosition,
  ShadingType,
} from 'docx'
import type {
  AtestateContent,
  AtestateInput,
  ContentTable,
  Inregistrare,
  Anexa,
  Cap1Sectiune,
  Cap2Sectiune,
} from '@/types/atestat'

// ─── Formatting constants ───────────────────────────────────────────────────

const TNR = 'Times New Roman'
const BODY_SIZE = 24        // 12pt (half-points)
const HEADING_SIZE = 28     // 14pt
const LINE_SPACING = 360    // 1.5 lines (twips)
const FIRST_INDENT = 720    // 720 dxa first-line indent for body
const LEFT_INDENT = 720     // bullet/list left indent
const HANGING = 360         // bullet hanging indent
const MARGIN_LEFT = 1800    // binding margin (dxa)
const MARGIN_OTHER = 1134   // other margins (dxa)
const PAGE_W = 11906        // A4 width (dxa)
const PAGE_H = 16838        // A4 height (dxa)

const HEADER_FILL = 'D9D9D9'
const ROW_ODD = 'F5F5F5'
const ROW_EVEN = 'FFFFFF'

// ─── Paragraph helpers ──────────────────────────────────────────────────────

function body(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, font: TNR, size: BODY_SIZE })],
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: FIRST_INDENT },
    spacing: { line: LINE_SPACING },
  })
}

function chapterHeading(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, font: TNR, size: HEADING_SIZE, bold: true })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 160, line: LINE_SPACING },
  })
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, font: TNR, size: HEADING_SIZE, bold: true })],
    alignment: AlignmentType.LEFT,
    spacing: { before: 200, after: 120, line: LINE_SPACING },
  })
}

function centeredBody(text: string, bold = false): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, font: TNR, size: BODY_SIZE, bold })],
    alignment: AlignmentType.CENTER,
    spacing: { line: LINE_SPACING },
  })
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: `• ${text}`, font: TNR, size: BODY_SIZE })],
    alignment: AlignmentType.JUSTIFIED,
    indent: { left: LEFT_INDENT, hanging: HANGING },
    spacing: { line: LINE_SPACING },
  })
}

function numbered(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, font: TNR, size: BODY_SIZE })],
    alignment: AlignmentType.JUSTIFIED,
    indent: { left: LEFT_INDENT, hanging: HANGING },
    spacing: { line: LINE_SPACING },
  })
}

function emptyLine(): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: '', font: TNR, size: BODY_SIZE })],
    spacing: { line: LINE_SPACING },
  })
}

function pageBreak(): Paragraph {
  return new Paragraph({
    children: [new TextRun({ break: 1 })],
  })
}

// ─── Table helper ───────────────────────────────────────────────────────────

function buildTable(tableData: ContentTable, widthPct = 100): Table {
  const border = {
    top: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
    bottom: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
    left: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
    right: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
    insideH: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
    insideV: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
  }

  const colCount = tableData.headers.length
  const colWidth = Math.floor((PAGE_W - MARGIN_LEFT - MARGIN_OTHER) / colCount)

  const headerRow = new TableRow({
    children: tableData.headers.map((h) =>
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: h, font: TNR, size: 20, bold: true })],
            alignment: AlignmentType.CENTER,
            spacing: { line: 240 },
          }),
        ],
        shading: { type: ShadingType.CLEAR, fill: HEADER_FILL },
        borders: border,
        width: { size: colWidth, type: WidthType.DXA },
      })
    ),
  })

  const dataRows = tableData.rows.map((row, rowIdx) =>
    new TableRow({
      children: row.map((cell) =>
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: cell, font: TNR, size: 20 })],
              alignment: AlignmentType.CENTER,
              spacing: { line: 240 },
            }),
          ],
          shading: { type: ShadingType.CLEAR, fill: rowIdx % 2 === 0 ? ROW_ODD : ROW_EVEN },
          borders: border,
          width: { size: colWidth, type: WidthType.DXA },
        })
      ),
    })
  )

  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: widthPct, type: WidthType.PERCENTAGE },
  })
}

// ─── SWOT table helper ──────────────────────────────────────────────────────

function buildSwotTable(leftHeader: string, rightHeader: string, leftItems: string[], rightItems: string[]): Table {
  const border = {
    top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    insideH: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
    insideV: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  }
  const colW = Math.floor((PAGE_W - MARGIN_LEFT - MARGIN_OTHER) / 2)

  const makeCell = (header: string, items: string[], fill: string) =>
    new TableCell({
      children: [
        new Paragraph({
          children: [new TextRun({ text: header, font: TNR, size: 20, bold: true })],
          alignment: AlignmentType.CENTER,
          spacing: { line: 240 },
        }),
        ...items.map((item) =>
          new Paragraph({
            children: [new TextRun({ text: `• ${item}`, font: TNR, size: 20 })],
            indent: { left: 360 },
            spacing: { line: 240 },
          })
        ),
      ],
      shading: { type: ShadingType.CLEAR, fill },
      borders: border,
      width: { size: colW, type: WidthType.DXA },
    })

  return new Table({
    rows: [
      new TableRow({
        children: [
          makeCell(leftHeader, leftItems, 'EBF5EB'),
          makeCell(rightHeader, rightItems, 'FDECEA'),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  })
}

// ─── Accounting entry helper ─────────────────────────────────────────────────

function buildEntry(entry: Inregistrare): Paragraph[] {
  const paras: Paragraph[] = []

  // Title line
  paras.push(
    new Paragraph({
      children: [new TextRun({ text: `${entry.nr}. ${entry.titlu}`, font: TNR, size: BODY_SIZE, bold: true })],
      spacing: { before: 160, line: LINE_SPACING },
    })
  )

  if (entry.tip === 'simpla') {
    // Debit line
    paras.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `     ${entry.cont_d} „${entry.denumire_d}" — ${entry.explicatie_d}`,
            font: TNR,
            size: BODY_SIZE,
          }),
        ],
        indent: { left: 1440 },
        spacing: { line: LINE_SPACING },
      })
    )
    // Credit line
    paras.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `     ${entry.cont_c} „${entry.denumire_c}" — ${entry.explicatie_c}`,
            font: TNR,
            size: BODY_SIZE,
          }),
        ],
        indent: { left: 1440 },
        spacing: { line: LINE_SPACING },
      })
    )
    // Formula line
    paras.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${entry.cont_d}  =  ${entry.cont_c}          ${formatLei(entry.suma)}`,
            font: TNR,
            size: BODY_SIZE,
            bold: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 120, line: LINE_SPACING },
      })
    )
  } else if (entry.tip === 'compusa_c') {
    // Single debit
    paras.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `     ${entry.cont_d} „${entry.denumire_d}" — ${entry.explicatie_d}`,
            font: TNR,
            size: BODY_SIZE,
          }),
        ],
        indent: { left: 1440 },
        spacing: { line: LINE_SPACING },
      })
    )
    // Multiple credits
    for (const cc of entry.conturi_c) {
      paras.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `     ${cc.cont} „${cc.denumire}"${cc.explicatie ? ` — ${cc.explicatie}` : ''}`,
              font: TNR,
              size: BODY_SIZE,
            }),
          ],
          indent: { left: 1440 },
          spacing: { line: LINE_SPACING },
        })
      )
    }
    // Formula with %
    const creditLines = entry.conturi_c
      .map((cc) => `${cc.cont} = ${formatLei(cc.suma)}`)
      .join(',  ')
    paras.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${entry.cont_d}  =  %          ${formatLei(entry.suma_totala)}`,
            font: TNR,
            size: BODY_SIZE,
            bold: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { line: LINE_SPACING },
      })
    )
    paras.push(
      new Paragraph({
        children: [new TextRun({ text: creditLines, font: TNR, size: BODY_SIZE - 2 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 120, line: LINE_SPACING },
      })
    )
  } else if (entry.tip === 'compusa_d') {
    // Multiple debits
    for (const dc of entry.conturi_d) {
      paras.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `     ${dc.cont} „${dc.denumire}"${dc.explicatie ? ` — ${dc.explicatie}` : ''}`,
              font: TNR,
              size: BODY_SIZE,
            }),
          ],
          indent: { left: 1440 },
          spacing: { line: LINE_SPACING },
        })
      )
    }
    // Single credit
    paras.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `     ${entry.cont_c} „${entry.denumire_c}" — ${entry.explicatie_c}`,
            font: TNR,
            size: BODY_SIZE,
          }),
        ],
        indent: { left: 1440 },
        spacing: { line: LINE_SPACING },
      })
    )
    const debitLines = entry.conturi_d
      .map((dc) => `${dc.cont} = ${formatLei(dc.suma)}`)
      .join(',  ')
    paras.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `%  =  ${entry.cont_c}          ${formatLei(entry.suma_totala)}`,
            font: TNR,
            size: BODY_SIZE,
            bold: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { line: LINE_SPACING },
      })
    )
    paras.push(
      new Paragraph({
        children: [new TextRun({ text: debitLines, font: TNR, size: BODY_SIZE - 2 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 120, line: LINE_SPACING },
      })
    )
  }

  return paras
}

// ─── Annex builder ───────────────────────────────────────────────────────────

function buildAnexa(anexa: Anexa): Paragraph[] {
  const paras: Paragraph[] = [
    pageBreak(),
    new Paragraph({
      children: [new TextRun({ text: anexa.titlu, font: TNR, size: HEADING_SIZE, bold: true })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 160, line: LINE_SPACING },
    }),
    body(anexa.descriere),
    emptyLine(),
  ]

  if (anexa.tip === 'table' && anexa.table) {
    // handled below — can't push Table into Paragraph[]
  } else if (anexa.tip === 'document' && anexa.fields) {
    for (const f of anexa.fields) {
      paras.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${f.label}: `, font: TNR, size: BODY_SIZE, bold: true }),
            new TextRun({ text: f.value, font: TNR, size: BODY_SIZE }),
          ],
          spacing: { line: LINE_SPACING },
        })
      )
    }
  } else if (anexa.tip === 'registru_jurnal' && anexa.rows) {
    // built as table — handled in main builder
  } else if (anexa.tip === 'cont_t' && anexa.debit !== undefined && anexa.credit !== undefined) {
    // T-account as two-column table — handled below
  } else if (anexa.tip === 'balanta' && anexa.balanta_rows) {
    // built as table — handled below
  }

  return paras
}

// ─── Registru jurnal table ───────────────────────────────────────────────────

function buildRegistruJurnalTable(anexa: Anexa): Table | null {
  if (anexa.tip !== 'registru_jurnal' || !anexa.rows) return null
  return buildTable({
    headers: ['Nr.', 'Data', 'Document', 'Explicație', 'Simbol D', 'Simbol C', 'Sumă (lei)'],
    rows: anexa.rows.map((r) => [
      String(r.nr),
      r.data,
      r.document,
      r.explicatie,
      r.simbol_d,
      r.simbol_c,
      formatLei(r.suma),
    ]),
  })
}

// ─── Cont în T table ─────────────────────────────────────────────────────────

function buildContTTable(anexa: Anexa): Table | null {
  if (anexa.tip !== 'cont_t' || !anexa.debit || !anexa.credit) return null
  const maxRows = Math.max(anexa.debit.length, anexa.credit.length, 1)
  const rows: string[][] = []
  for (let i = 0; i < maxRows; i++) {
    const d = anexa.debit[i]
    const c = anexa.credit[i]
    rows.push([
      d ? d.explicatie : '',
      d ? formatLei(d.suma) : '',
      c ? c.explicatie : '',
      c ? formatLei(c.suma) : '',
    ])
  }
  // Totals row
  const totalD = (anexa.debit || []).reduce((s, e) => s + e.suma, 0)
  const totalC = (anexa.credit || []).reduce((s, e) => s + e.suma, 0)
  rows.push([`TOTAL DEBIT`, formatLei(totalD), `TOTAL CREDIT`, formatLei(totalC)])

  return buildTable({
    headers: ['Explicație DEBIT', 'Sumă (lei)', 'Explicație CREDIT', 'Sumă (lei)'],
    rows,
  })
}

// ─── Balanță table ───────────────────────────────────────────────────────────

function buildBalantaTable(anexa: Anexa): Table | null {
  if (anexa.tip !== 'balanta' || !anexa.balanta_rows) return null
  return buildTable({
    headers: ['Simbol', 'Denumire', 'SI Debit', 'SI Credit', 'Rulaj D', 'Rulaj C', 'SF Debit', 'SF Credit'],
    rows: anexa.balanta_rows.map((r) => [
      r.simbol,
      r.denumire,
      formatLei(r.sold_initial_d),
      formatLei(r.sold_initial_c),
      formatLei(r.rulaj_d),
      formatLei(r.rulaj_c),
      formatLei(r.sold_final_d),
      formatLei(r.sold_final_c),
    ]),
  })
}

// ─── Section builders ────────────────────────────────────────────────────────

function buildArgument(content: AtestateContent): (Paragraph)[] {
  const out: Paragraph[] = [
    chapterHeading('ARGUMENT'),
    emptyLine(),
  ]
  for (const p of content.argument.paragraphs) {
    out.push(body(p))
  }
  return out
}

function buildCap1(content: AtestateContent): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = [
    pageBreak(),
    chapterHeading('CAPITOLUL 1'),
    chapterHeading(`PREZENTAREA SOCIETĂȚII`),
    emptyLine(),
  ]

  for (const sec of content.cap1.sectiuni) {
    out.push(sectionHeading(`${sec.id}. ${sec.titlu}`))
    for (const p of sec.paragraphs) {
      out.push(body(p))
    }
    if (sec.items && sec.items.length > 0) {
      for (const item of sec.items) {
        if (/^\d+\./.test(item)) {
          out.push(numbered(item))
        } else {
          out.push(bullet(item.replace(/^[•\-]\s*/, '')))
        }
      }
    }
    if (sec.tables && sec.tables.length > 0) {
      for (const t of sec.tables) {
        out.push(emptyLine())
        out.push(buildTable(t))
        out.push(emptyLine())
      }
    }
  }
  return out
}

function buildCap2(content: AtestateContent): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = [
    pageBreak(),
    chapterHeading('CAPITOLUL 2'),
    chapterHeading('NOȚIUNI TEORETICE'),
    emptyLine(),
  ]

  for (const sec of content.cap2.sectiuni) {
    out.push(sectionHeading(`${sec.id}. ${sec.titlu}`))
    for (const p of sec.paragraphs) {
      out.push(body(p))
    }
    if (sec.items && sec.items.length > 0) {
      for (const item of sec.items) {
        if (/^[•\-]/.test(item)) {
          out.push(bullet(item.replace(/^[•\-]\s*/, '')))
        } else if (/^\d+\./.test(item)) {
          out.push(numbered(item))
        } else {
          out.push(bullet(item))
        }
      }
    }
    if (sec.tables && sec.tables.length > 0) {
      for (const t of sec.tables) {
        out.push(emptyLine())
        out.push(buildTable(t))
        out.push(emptyLine())
      }
    }
  }
  return out
}

function buildCap3(content: AtestateContent): Paragraph[] {
  const out: Paragraph[] = [
    pageBreak(),
    chapterHeading('CAPITOLUL 3'),
    chapterHeading('ÎNREGISTRĂRI CONTABILE'),
    emptyLine(),
    sectionHeading('3.1. Programul de contabilitate SAGA C.'),
  ]

  for (const p of content.cap3.saga.paragraphs) {
    out.push(body(p))
  }

  out.push(emptyLine())
  out.push(
    new Paragraph({
      children: [new TextRun({ text: 'Programul SAGA C. conține:', font: TNR, size: BODY_SIZE, bold: true })],
      spacing: { line: LINE_SPACING },
    })
  )
  for (const m of content.cap3.saga.module) {
    out.push(bullet(m.replace(/^[•\-]\s*/, '')))
  }

  out.push(emptyLine())
  out.push(
    new Paragraph({
      children: [new TextRun({ text: 'Avantajele programului SAGA C.:', font: TNR, size: BODY_SIZE, bold: true })],
      spacing: { line: LINE_SPACING },
    })
  )
  for (const a of content.cap3.saga.avantaje) {
    out.push(bullet(a.replace(/^[•\-]\s*/, '')))
  }

  out.push(emptyLine())
  out.push(sectionHeading('3.2. Înregistrarea operațiilor contabile'))
  out.push(body(content.cap3.intro_paragraph))
  out.push(emptyLine())

  for (const entry of content.cap3.inregistrari) {
    out.push(...buildEntry(entry))
  }

  return out
}

function buildCap4(content: AtestateContent): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = [
    pageBreak(),
    chapterHeading('CAPITOLUL 4'),
    chapterHeading('STUDIU DE CAZ'),
    emptyLine(),
    sectionHeading('4.1. Analiza pieței'),
  ]

  const ap = content.cap4.analiza_pietei
  for (const p of ap.paragraphs) {
    out.push(body(p))
  }

  out.push(emptyLine())
  out.push(new Paragraph({ children: [new TextRun({ text: 'Piețe țintă:', font: TNR, size: BODY_SIZE, bold: true })], spacing: { line: LINE_SPACING } }))
  for (const pt of ap.piete_tinta) {
    out.push(bullet(pt))
  }

  out.push(emptyLine())
  out.push(new Paragraph({ children: [new TextRun({ text: 'Concurenți:', font: TNR, size: BODY_SIZE, bold: true })], spacing: { line: LINE_SPACING } }))
  out.push(bullet(`Concurenți internaționali: ${ap.concurenti.internationali}`))
  out.push(bullet(`Concurenți locali (mari): ${ap.concurenti.locali_mari}`))
  out.push(bullet(`Concurenți mici / startup: ${ap.concurenti.mici_startup}`))

  out.push(emptyLine())
  out.push(new Paragraph({ children: [new TextRun({ text: 'Obiective economice:', font: TNR, size: BODY_SIZE, bold: true })], spacing: { line: LINE_SPACING } }))
  for (const obj of ap.obiective_economice) {
    out.push(bullet(obj))
  }

  out.push(emptyLine())
  out.push(new Paragraph({ children: [new TextRun({ text: 'Obiective psihologice:', font: TNR, size: BODY_SIZE, bold: true })], spacing: { line: LINE_SPACING } }))
  for (const obj of ap.obiective_psihologice) {
    out.push(bullet(obj))
  }

  // SWOT
  out.push(emptyLine())
  out.push(new Paragraph({ children: [new TextRun({ text: 'Analiza SWOT', font: TNR, size: BODY_SIZE, bold: true })], alignment: AlignmentType.CENTER, spacing: { line: LINE_SPACING } }))
  out.push(emptyLine())
  out.push(buildSwotTable('Puncte tari', 'Puncte slabe', ap.swot.puncte_tari, ap.swot.puncte_slabe))
  out.push(emptyLine())
  out.push(buildSwotTable('Oportunități', 'Amenințări', ap.swot.oportunitati, ap.swot.amenintari))
  out.push(emptyLine())

  // Marketing
  const mk = content.cap4.marketing
  out.push(sectionHeading('4.2. Politici de marketing'))
  out.push(new Paragraph({ children: [new TextRun({ text: 'Componentele mixului de marketing', font: TNR, size: BODY_SIZE, bold: true })], spacing: { line: LINE_SPACING } }))

  for (const [key, label] of [['produs', 'PRODUS'], ['pret', 'PREȚ'], ['distributie', 'DISTRIBUȚIE'], ['promovare', 'PROMOVARE']] as const) {
    const pol = mk[key as keyof typeof mk]
    if (!pol || typeof pol !== 'object' || !('paragraphs' in pol)) continue
    out.push(new Paragraph({ children: [new TextRun({ text: `Politica de ${label}`, font: TNR, size: BODY_SIZE, bold: true, underline: {} })], spacing: { before: 120, line: LINE_SPACING } }))
    for (const p of pol.paragraphs) {
      out.push(body(p))
    }
    const listItems = pol.linii ?? pol.strategii ?? pol.canale ?? pol.instrumente ?? []
    if (pol.linii) {
      for (const linie of pol.linii) {
        out.push(bullet(linie.linie))
        for (const d of linie.detalii) {
          out.push(
            new Paragraph({
              children: [new TextRun({ text: `   – ${d}`, font: TNR, size: BODY_SIZE })],
              indent: { left: LEFT_INDENT + 360 },
              spacing: { line: LINE_SPACING },
            })
          )
        }
      }
    } else {
      for (const item of listItems) {
        out.push(bullet(String(item)))
      }
    }
  }

  out.push(emptyLine())
  out.push(new Paragraph({ children: [new TextRun({ text: 'Strategiile firmei', font: TNR, size: BODY_SIZE, bold: true })], spacing: { line: LINE_SPACING } }))
  for (const s of mk.strategii_firma) {
    out.push(bullet(s))
  }

  // Negociere
  const neg = content.cap4.negociere
  out.push(emptyLine())
  out.push(sectionHeading('4.3. Negociere'))
  out.push(new Paragraph({ children: [new TextRun({ text: 'Stilurile de negociere', font: TNR, size: BODY_SIZE, bold: true })], spacing: { line: LINE_SPACING } }))
  for (const p of neg.paragraphs) {
    out.push(body(p))
  }
  for (const s of neg.stiluri) {
    out.push(bullet(s))
  }

  out.push(emptyLine())
  out.push(new Paragraph({ children: [new TextRun({ text: 'Tehnicile și tacticile de negociere', font: TNR, size: BODY_SIZE, bold: true })], spacing: { line: LINE_SPACING } }))
  for (const p of neg.tehnici_paragraphs) {
    out.push(body(p))
  }
  out.push(new Paragraph({ children: [new TextRun({ text: 'Pregătirea negocierii:', font: TNR, size: BODY_SIZE, bold: true })], spacing: { line: LINE_SPACING } }))
  for (const item of neg.pregatire) {
    out.push(numbered(item))
  }
  out.push(emptyLine())
  out.push(new Paragraph({ children: [new TextRun({ text: 'Tehnici de negociere:', font: TNR, size: BODY_SIZE, bold: true })], spacing: { line: LINE_SPACING } }))
  for (const item of neg.tehnici) {
    out.push(numbered(item))
  }
  out.push(emptyLine())
  out.push(new Paragraph({ children: [new TextRun({ text: 'Aplicarea negocierii în contextul temei:', font: TNR, size: BODY_SIZE, bold: true })], spacing: { line: LINE_SPACING } }))
  for (const item of neg.aplicare_tema) {
    out.push(bullet(item))
  }

  return out
}

function buildConcluzii(content: AtestateContent): Paragraph[] {
  const out: Paragraph[] = [pageBreak(), chapterHeading('CONCLUZII'), emptyLine()]
  for (const p of content.concluzii.paragraphs) {
    out.push(body(p))
  }
  return out
}

function buildBibliografie(content: AtestateContent): Paragraph[] {
  const out: Paragraph[] = [pageBreak(), chapterHeading('BIBLIOGRAFIE'), emptyLine()]
  for (const item of content.bibliografie.items) {
    out.push(
      new Paragraph({
        children: [new TextRun({ text: item, font: TNR, size: BODY_SIZE })],
        spacing: { line: LINE_SPACING },
        indent: { left: 360 },
      })
    )
  }
  return out
}

// ─── Cover pages ─────────────────────────────────────────────────────────────

function buildCovers(input: AtestateInput): Paragraph[] {
  const makeCovers = (withTema: boolean) => [
    emptyLine(),
    emptyLine(),
    centeredBody(input.liceu.toUpperCase(), true),
    emptyLine(),
    centeredBody('PROIECT PENTRU OBȚINEREA CERTIFICATULUI DE CALIFICARE PROFESIONALĂ NIVEL 4', true),
    emptyLine(),
    centeredBody(`SPECIALIZARE: ${input.specializare}`, true),
    emptyLine(),
    emptyLine(),
    ...(withTema
      ? [centeredBody(input.tema.toUpperCase(), true), emptyLine(), emptyLine()]
      : [emptyLine(), emptyLine(), emptyLine()]),
    emptyLine(),
    emptyLine(),
    new Paragraph({
      children: [
        new TextRun({ text: `Prof. coordonator:${'\t\t\t\t\t'}Absolvent:`, font: TNR, size: BODY_SIZE }),
      ],
      spacing: { line: LINE_SPACING },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `${input.profesor_coordonator}${'\t\t\t\t\t'}${input.student_name}`, font: TNR, size: BODY_SIZE }),
      ],
      spacing: { line: LINE_SPACING },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `${'\t\t\t\t\t\t'}Clasa ${input.clasa}`, font: TNR, size: BODY_SIZE }),
      ],
      spacing: { line: LINE_SPACING },
    }),
    emptyLine(),
    emptyLine(),
    emptyLine(),
    centeredBody(`BUCUREȘTI`, true),
    centeredBody(input.an, true),
  ]

  return [
    ...makeCovers(false),
    pageBreak(),
    ...makeCovers(true),
  ]
}

// ─── Format number as lei ────────────────────────────────────────────────────

function formatLei(amount: number): string {
  return new Intl.NumberFormat('ro-RO').format(amount) + ' lei'
}

// ─── Page number footer ───────────────────────────────────────────────────────

function pageNumFooter(): Footer {
  return new Footer({
    children: [
      new Paragraph({
        children: [
          new TextRun({ children: [PageNumber.CURRENT], font: TNR, size: BODY_SIZE }),
        ],
        alignment: AlignmentType.CENTER,
      }),
    ],
  })
}

// ─── Common section properties ────────────────────────────────────────────────

const PAGE_PROPS = {
  page: {
    margin: {
      top: MARGIN_OTHER,
      right: MARGIN_OTHER,
      bottom: MARGIN_OTHER,
      left: MARGIN_LEFT,
    },
    size: { width: PAGE_W, height: PAGE_H },
  },
}

// ─── Main builder ─────────────────────────────────────────────────────────────

export async function buildDocx(
  content: AtestateContent,
  input: AtestateInput
): Promise<Buffer> {
  // Section 1 — Covers (no page numbers)
  const section1Children: Paragraph[] = buildCovers(input)

  // Section 2 — Body (page numbers start at 1)
  const bodyChildren: (Paragraph | Table)[] = [
    ...buildArgument(content),
    ...buildCap1(content),
    ...buildCap2(content),
    ...buildCap3(content),
    ...buildCap4(content),
    ...buildConcluzii(content),
    ...buildBibliografie(content),
  ]

  // Section 3 — Anexe (no page numbers)
  const anexeChildren: (Paragraph | Table)[] = []
  for (const anexa of content.anexe) {
    const headerAndDesc = buildAnexa(anexa)
    anexeChildren.push(...headerAndDesc)

    if (anexa.tip === 'table' && anexa.table) {
      anexeChildren.push(buildTable(anexa.table))
    } else if (anexa.tip === 'registru_jurnal') {
      const t = buildRegistruJurnalTable(anexa)
      if (t) anexeChildren.push(t)
    } else if (anexa.tip === 'cont_t') {
      const t = buildContTTable(anexa)
      if (t) anexeChildren.push(t)
    } else if (anexa.tip === 'balanta') {
      const t = buildBalantaTable(anexa)
      if (t) anexeChildren.push(t)
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: { ...PAGE_PROPS },
        children: section1Children,
      },
      {
        properties: {
          ...PAGE_PROPS,
          page: {
            ...PAGE_PROPS.page,
            pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
          },
        },
        footers: { default: pageNumFooter() },
        children: bodyChildren,
      },
      {
        properties: { ...PAGE_PROPS },
        children: anexeChildren,
      },
    ],
  })

  return Buffer.from(await Packer.toBuffer(doc))
}
