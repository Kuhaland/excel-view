// ExcelJS 기반 엑셀 파싱 + 셀 스타일(색상)/병합 추출 유틸
import ExcelJS from 'exceljs'

// Office 표준 테마 색상 팔레트 (ExcelJS color.theme 인덱스 기준 근사치)
const THEME = [
  'FFFFFF', '000000', 'E7E6E6', '44546A', // bg1, text1, bg2, text2
  '4472C4', 'ED7D31', 'A5A5A5', 'FFC000', '5B9BD5', '70AD47', // accent 1~6
  '0563C1', '954F72', // hyperlink, followed
]

// 레거시 indexed 색상 팔레트 (Excel 기본 56색). 많은 파일이 이 방식으로 색을 저장한다.
const INDEXED = [
  '000000', 'FFFFFF', 'FF0000', '00FF00', '0000FF', 'FFFF00', 'FF00FF', '00FFFF',
  '000000', 'FFFFFF', 'FF0000', '00FF00', '0000FF', 'FFFF00', 'FF00FF', '00FFFF',
  '800000', '008000', '000080', '808000', '800080', '008080', 'C0C0C0', '808080',
  '9999FF', '993366', 'FFFFCC', 'CCFFFF', '660066', 'FF8080', '0066CC', 'CCCCFF',
  '000080', 'FF00FF', 'FFFF00', '00FFFF', '800080', '800000', '008080', '0000FF',
  '00CCFF', 'CCFFFF', 'CCFFCC', 'FFFF99', '99CCFF', 'FF99CC', 'CC99FF', 'FFCC99',
  '3366FF', '33CCCC', '99CC00', 'FFCC00', 'FF9900', 'FF6600', '666699', '969696',
  '003366', '339966', '003300', '333300', '993300', '993366', '333399', '333333',
]
// 64 = 자동(글자, 검정), 65 = 자동(배경, 흰색)
INDEXED[64] = '000000'
INDEXED[65] = 'FFFFFF'

// ---- 색상 변환 ----------------------------------------------------------
function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  }
}

function rgbToHex({ r, g, b }) {
  const h = (n) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0')
  return '#' + h(r) + h(g) + h(b)
}

// OOXML tint 적용 (HSL 휘도 보정)
function applyTint(hex, tint) {
  if (!tint) return '#' + hex
  let { r, g, b } = hexToRgb(hex)
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2
  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      default: h = (r - g) / d + 4
    }
    h /= 6
  }
  l = tint < 0 ? l * (1 + tint) : l * (1 - tint) + tint
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  let nr, ng, nb
  if (s === 0) {
    nr = ng = nb = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    nr = hue2rgb(p, q, h + 1 / 3)
    ng = hue2rgb(p, q, h)
    nb = hue2rgb(p, q, h - 1 / 3)
  }
  return rgbToHex({ r: nr * 255, g: ng * 255, b: nb * 255 })
}

// ExcelJS 색상 객체 -> CSS hex (없으면 null)
function resolveColor(c) {
  if (!c) return null
  if (c.argb) return '#' + c.argb.slice(-6) // ARGB -> RRGGBB
  if (typeof c.theme === 'number' && THEME[c.theme]) {
    return applyTint(THEME[c.theme], c.tint || 0)
  }
  if (typeof c.indexed === 'number' && INDEXED[c.indexed]) {
    return applyTint(INDEXED[c.indexed], c.tint || 0)
  }
  return null
}

// 채우기 색 추출 (solid/gradient 등 다양한 형태 대응)
function fillColor(fill) {
  if (!fill) return null
  if (fill.type === 'pattern') {
    if (fill.pattern && fill.pattern !== 'none') {
      return resolveColor(fill.fgColor) || resolveColor(fill.bgColor)
    }
    return null
  }
  if (fill.type === 'gradient' && Array.isArray(fill.stops) && fill.stops.length) {
    return resolveColor(fill.stops[0].color)
  }
  return null
}

// ---- 값 변환 ------------------------------------------------------------
function pad(n) { return String(n).padStart(2, '0') }

function formatDate(d) {
  const ymd = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  if (d.getHours() || d.getMinutes() || d.getSeconds()) {
    return `${ymd} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
  return ymd
}

function valueToString(v) {
  if (v == null) return ''
  if (v instanceof Date) return formatDate(v)
  if (typeof v === 'object') {
    if (Array.isArray(v.richText)) return v.richText.map((t) => t.text).join('')
    if (v.text != null) return String(v.text) // hyperlink
    if ('result' in v) return v.result == null ? '' : String(v.result) // formula
    if ('error' in v) return String(v.error)
    if ('formula' in v) return ''
    return String(v)
  }
  return String(v)
}

// 리치 텍스트(셀 내부 부분 서식) -> run 배열. 일반 값이면 null
function extractRuns(value) {
  if (value && typeof value === 'object' && Array.isArray(value.richText)) {
    return value.richText.map((r) => {
      const f = r.font || {}
      return {
        text: r.text ?? '',
        bold: !!f.bold,
        italic: !!f.italic,
        underline: !!f.underline,
        strike: !!f.strike,
        color: resolveColor(f.color),
        size: f.size || null, // 포인트(pt) 단위
      }
    })
  }
  return null
}

function extractCell(cell) {
  const font = cell.font || {}
  const align = cell.alignment || {}
  return {
    v: valueToString(cell.value),
    runs: extractRuns(cell.value), // 셀 내부 부분 서식
    bg: fillColor(cell.fill),
    fg: resolveColor(font.color),
    bold: !!font.bold,
    italic: !!font.italic,
    underline: !!font.underline,
    strike: !!font.strike,
    size: font.size || null, // 포인트(pt) 단위
    align: align.horizontal || null,
    valign: align.vertical || null,
    wrap: !!align.wrapText, // 자동 줄 바꿈
    rowspan: 1,
    colspan: 1,
    skip: false, // 병합으로 가려진 셀이면 true
  }
}

// ---- 주소/범위 디코딩 ---------------------------------------------------
function colToNum(s) {
  let n = 0
  for (const ch of s) n = n * 26 + (ch.charCodeAt(0) - 64)
  return n
}
function decodeAddr(addr) {
  const m = /^([A-Z]+)(\d+)$/.exec(addr)
  return m ? { col: colToNum(m[1]), row: parseInt(m[2], 10) } : null
}

// ---- CSV (색상/병합 없음) -----------------------------------------------
function parseCsv(text) {
  const rows = []
  let row = [], field = '', inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ }
        else inQuotes = false
      } else field += ch
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      row.push(field); field = ''
    } else if (ch === '\n') {
      row.push(field); rows.push(row); row = []; field = ''
    } else if (ch === '\r') {
      // skip
    } else field += ch
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row) }
  return rows.map((r) =>
    r.map((v) => ({
      v, runs: null, bg: null, fg: null, bold: false, italic: false,
      underline: false, strike: false, size: null, align: null, valign: null, wrap: false,
      rowspan: 1, colspan: 1, skip: false,
    }))
  )
}

// ---- 공개 진입점 --------------------------------------------------------
// 반환: [{ name, rows: Cell[][] }]
export async function parseWorkbook(file) {
  if (file.name.toLowerCase().endsWith('.csv')) {
    const text = await file.text()
    return [{ name: file.name.replace(/\.csv$/i, ''), rows: parseCsv(text) }]
  }

  const buf = await file.arrayBuffer()
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(buf)

  return wb.worksheets.map((ws) => {
    const colCount = ws.columnCount || 0
    const rowCount = ws.rowCount || 0
    const rows = []
    for (let r = 1; r <= rowCount; r++) {
      const wsRow = ws.getRow(r)
      const cells = []
      for (let c = 1; c <= colCount; c++) {
        cells.push(extractCell(wsRow.getCell(c)))
      }
      rows.push(cells)
    }

    // 병합 적용: model.merges = ["A1:C2", ...]
    const merges = (ws.model && ws.model.merges) || []
    for (const range of merges) {
      const [a, b] = range.split(':')
      const tl = decodeAddr(a)
      const br = decodeAddr(b || a)
      if (!tl || !br) continue
      const top = Math.min(tl.row, br.row), bottom = Math.max(tl.row, br.row)
      const left = Math.min(tl.col, br.col), right = Math.max(tl.col, br.col)
      const master = rows[top - 1]?.[left - 1]
      if (!master) continue
      master.rowspan = bottom - top + 1
      master.colspan = right - left + 1
      for (let r = top; r <= bottom; r++) {
        for (let c = left; c <= right; c++) {
          if (r === top && c === left) continue
          const cell = rows[r - 1]?.[c - 1]
          if (cell) cell.skip = true
        }
      }
    }

    return { name: ws.name, rows }
  })
}
