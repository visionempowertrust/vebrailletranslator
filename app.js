const canvas = document.getElementById("scanCanvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const imageInput = document.getElementById("imageInput");
const outputText = document.getElementById("outputText");
const statusText = document.getElementById("statusText");
const engineStatus = document.getElementById("engineStatus");
const selectedTableName = document.getElementById("selectedTableName");
const selectedTableDescription = document.getElementById("selectedTableDescription");
const dotCount = document.getElementById("dotCount");
const reverseDotCount = document.getElementById("reverseDotCount");
const cellCount = document.getElementById("cellCount");

const controls = {
  translationTable: document.getElementById("translationTable"),
  polarity: document.getElementById("polarity"),
  threshold: document.getElementById("threshold"),
  gridStandard: document.getElementById("gridStandard"),
  imageZoom: document.getElementById("imageZoom"),
  imageOffsetX: document.getElementById("imageOffsetX"),
  imageOffsetY: document.getElementById("imageOffsetY"),
  gridScale: document.getElementById("gridScale"),
  showBoxes: document.getElementById("showBoxes"),
  doubleSided: document.getElementById("doubleSided")
};

const readouts = {
  threshold: document.getElementById("thresholdValue"),
  imageZoom: document.getElementById("imageZoomValue"),
  imageOffsetX: document.getElementById("imageOffsetXValue"),
  imageOffsetY: document.getElementById("imageOffsetYValue"),
  gridScale: document.getElementById("gridScaleValue")
};

const UEB_GRADE1_SYMBOLS = {
  1: "a", 3: "b", 9: "c", 25: "d", 17: "e", 11: "f", 27: "g", 19: "h", 10: "i", 26: "j",
  5: "k", 7: "l", 13: "m", 29: "n", 21: "o", 15: "p", 31: "q", 23: "r", 14: "s", 30: "t",
  37: "u", 39: "v", 58: "w", 45: "x", 61: "y", 53: "z",
  2: ",", 6: ";", 18: ":", 50: ".", 38: "?", 22: "!", 36: "-", 4: "'"
};

const UEB_INDICATORS = {
  capital: 32,
  grade1Symbol: 48,
  number: 60,
  punctuation: 16,
  quote: 24
};

const UEB_GRADE1_NUMBERS = {
  a: "1", b: "2", c: "3", d: "4", e: "5", f: "6", g: "7", h: "8", i: "9", j: "0"
};

const UEB_PUNCTUATION_PREFIX_SYMBOLS = {
  11: "(",
  28: ")"
};

const UEB_QUOTE_PREFIX_SYMBOLS = {
  38: "\"",
  52: "\""
};

const BRAILLE_GRID_STANDARDS = {
  paper: {
    name: "BANA/NLS paper braille",
    dotPitchMm: 2.34,
    cellPitchMm: 6.2,
    linePitchMm: 10,
    dotDiameterMm: 1.44
  },
  signage: {
    name: "ANSI/ADA signage braille",
    dotPitchMm: 2.4,
    cellPitchMm: 6.85,
    linePitchMm: 10.1,
    dotDiameterMm: 1.55
  }
};

const CSS_PX_PER_MM = 96 / 25.4;

const TRANSLATION_TABLES = [
  {
    id: "ueb-g1",
    label: "English/Unified UEB Grade 1 (uncontracted)",
    table: "en-ueb-g1.ctb",
    description: "UEB English Grade 1 Braille without contractions"
  },
  {
    id: "ueb-g2",
    label: "English/Unified UEB Grade 2 (contracted)",
    table: "en-ueb-g2.ctb",
    description: "UEB English contracted Braille"
  },
  {
    id: "en-us-g1",
    label: "English/American Grade 1",
    table: "en-us-g1.ctb",
    description: "English/American uncontracted Braille"
  },
  {
    id: "en-us-g2",
    label: "English/American Grade 2",
    table: "en-us-g2.ctb",
    description: "English/American contracted Braille"
  },
  {
    id: "en-gb-g1",
    label: "English/British Grade 1",
    table: "en-gb-g1.utb",
    description: "English/British uncontracted Braille"
  },
  {
    id: "en-gb-g2",
    label: "English/British Grade 2",
    table: "en-GB-g2.ctb",
    description: "English/British contracted Braille"
  },
  {
    id: "en-in-g1",
    label: "English/India Grade 1",
    table: "en-in-g1.ctb",
    description: "English/India uncontracted Braille"
  },
  {
    id: "hi-in-g1",
    label: "Hindi/India Grade 1",
    table: "hi-in-g1.utb",
    description: "Hindi Bharati Braille Grade 1"
  },
  {
    id: "ta-ta-g1",
    label: "Tamil Grade 1",
    table: "ta-ta-g1.ctb",
    description: "Tamil Braille Grade 1"
  },
  {
    id: "te-in-g1",
    label: "Telugu/India Grade 1",
    table: "te-in-g1.utb",
    description: "Telugu Braille Grade 1"
  },
  {
    id: "kn-in-g1",
    label: "Kannada/India Grade 1",
    table: "kn.tbl",
    description: "Kannada Braille Grade 1"
  },
  {
    id: "ml-in-g1",
    label: "Malayalam/India Grade 1",
    table: "ml-in-g1.utb",
    description: "Malayalam Braille Grade 1"
  },
  {
    id: "gu-in-g1",
    label: "Gujarati/India Grade 1",
    table: "gu-in-g1.utb",
    description: "Gujarati Braille Grade 1"
  },
  {
    id: "mr-in-g1",
    label: "Marathi/India Grade 1",
    table: "mr-in-g1.utb",
    description: "Marathi Braille Grade 1"
  },
  {
    id: "ur-pk-g1",
    label: "Urdu/Pakistani Grade 1",
    table: "ur-pk-g1.utb",
    description: "Urdu Braille Grade 1"
  }
];

let sourceImage = null;
let sourceLabel = "";
let processRunId = 0;
let processTimer = 0;

function populateTranslationTables() {
  controls.translationTable.innerHTML = "";
  for (const item of getTranslationTables()) {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.label;
    controls.translationTable.append(option);
  }
  const defaultTable = getTranslationTables().find((item) => item.table === "en-ueb-g1.ctb");
  if (defaultTable) controls.translationTable.value = defaultTable.id;
}

function getTranslationTables() {
  return Array.isArray(window.LIBLOUIS_TABLE_CATALOG) && window.LIBLOUIS_TABLE_CATALOG.length
    ? window.LIBLOUIS_TABLE_CATALOG
    : TRANSLATION_TABLES;
}

function getSelectedTranslationTable() {
  const tables = getTranslationTables();
  return tables.find((item) => item.id === controls.translationTable.value) || tables[0];
}

function setEngineStatus(state, message) {
  engineStatus.dataset.state = state;
  engineStatus.textContent = message;
}

async function initializeTranslationEngine() {
  if (!window.liblouisEngine) {
    setEngineStatus("error", "Translation engine: local fallback");
    return;
  }

  try {
    setEngineStatus("loading", "Translation engine: Liblouis loading...");
    await window.liblouisEngine.init();
    setEngineStatus("ready", `Translation engine: Liblouis ${window.liblouisEngine.version}`);
  } catch (error) {
    setEngineStatus("error", "Translation engine: local fallback");
    console.warn("Liblouis initialization failed; local fallback table is active.", error);
  }
}

function scheduleProcess(options = {}) {
  window.clearTimeout(processTimer);
  processTimer = window.setTimeout(() => {
    processImage(options);
  }, 80);
}

function syncReadouts() {
  readouts.threshold.textContent = controls.threshold.value;
  readouts.imageZoom.textContent = `${controls.imageZoom.value}%`;
  readouts.imageOffsetX.textContent = `${controls.imageOffsetX.value} px`;
  readouts.imageOffsetY.textContent = `${controls.imageOffsetY.value} px`;
  readouts.gridScale.textContent = `${controls.gridScale.value}%`;
  if (controls.translationTable.options.length) {
    const selectedTable = getSelectedTranslationTable();
    selectedTableName.textContent = selectedTable.label;
    selectedTableDescription.textContent = selectedTable.description;
  }
}

function fitCanvasToImage(img) {
  const maxWidth = 1600;
  const baseRatio = Math.min(1, maxWidth / img.width);
  const zoom = Number(controls.imageZoom.value) / 100;
  const width = Math.max(320, Math.round(img.width * baseRatio * zoom));
  const height = Math.max(240, Math.round(img.height * baseRatio * zoom));
  const offsetX = Number(controls.imageOffsetX.value);
  const offsetY = Number(controls.imageOffsetY.value);
  canvas.width = Math.max(320, width + Math.abs(offsetX) * 2);
  canvas.height = Math.max(240, height + Math.abs(offsetY) * 2);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fbfaf5";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, offsetX, offsetY, width, height);
}

function getGridMetrics() {
  const standard = BRAILLE_GRID_STANDARDS[controls.gridStandard.value] || BRAILLE_GRID_STANDARDS.paper;
  const scale = Number(controls.gridScale.value) / 100;
  return {
    standard,
    dotPitch: standard.dotPitchMm * CSS_PX_PER_MM * scale,
    cellPitch: standard.cellPitchMm * CSS_PX_PER_MM * scale,
    linePitch: standard.linePitchMm * CSS_PX_PER_MM * scale,
    dotRadius: standard.dotDiameterMm * CSS_PX_PER_MM * scale * 0.5
  };
}

function getBinaryMask(imageData, polarity = controls.polarity.value) {
  const { data, width, height } = imageData;
  const mask = new Uint8Array(width * height);
  const threshold = Number(controls.threshold.value);
  const darkDots = polarity === "dark";

  if (!darkDots) {
    return getEmbossedMask(imageData);
  }

  for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    mask[p] = gray < threshold ? 1 : 0;
  }

  return mask;
}

function getEmbossedMask(imageData) {
  const { data, width, height } = imageData;
  const gray = new Uint8ClampedArray(width * height);
  const mask = new Uint8Array(width * height);
  const threshold = Math.max(5, Number(controls.threshold.value) / 9);
  const radius = 6;
  const stride = width + 1;
  const integral = new Float64Array((width + 1) * (height + 1));

  for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
    gray[p] = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
  }

  for (let y = 0; y < height; y += 1) {
    let rowSum = 0;
    for (let x = 0; x < width; x += 1) {
      rowSum += gray[y * width + x];
      integral[(y + 1) * stride + x + 1] = integral[y * stride + x + 1] + rowSum;
    }
  }

  for (let y = radius; y < height - radius; y += 1) {
    for (let x = radius; x < width - radius; x += 1) {
      const left = x - radius;
      const right = x + radius + 1;
      const top = y - radius;
      const bottom = y + radius + 1;
      const area = (right - left) * (bottom - top);
      const sum = integral[bottom * stride + right] - integral[top * stride + right] - integral[bottom * stride + left] + integral[top * stride + left];
      const localAverage = sum / area;
      const index = y * width + x;
      const contrast = Math.abs(gray[index] - localAverage);
      const edgeContrast = Math.abs(gray[index - 1] - gray[index + 1]) + Math.abs(gray[index - width] - gray[index + width]);
      mask[index] = contrast > threshold || edgeContrast > threshold * 2.4 ? 1 : 0;
    }
  }

  return dilateMask(erodeMask(dilateMask(mask, width, height, 2), width, height, 1), width, height, 1);
}

function dilateMask(mask, width, height, iterations) {
  let current = mask;
  for (let pass = 0; pass < iterations; pass += 1) {
    const next = new Uint8Array(current);
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const index = y * width + x;
        if (current[index]) continue;
        next[index] = current[index - 1] || current[index + 1] || current[index - width] || current[index + width] ? 1 : 0;
      }
    }
    current = next;
  }
  return current;
}

function erodeMask(mask, width, height, iterations) {
  let current = mask;
  for (let pass = 0; pass < iterations; pass += 1) {
    const next = new Uint8Array(current);
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const index = y * width + x;
        if (!current[index]) continue;
        next[index] = current[index - 1] && current[index + 1] && current[index - width] && current[index + width] ? 1 : 0;
      }
    }
    current = next;
  }
  return current;
}

function detectComponents(mask, width, height) {
  const seen = new Uint8Array(mask.length);
  const dots = [];
  const { dotRadius } = getGridMetrics();
  const expectedDotArea = Math.PI * dotRadius * dotRadius;
  const minArea = Math.max(2, expectedDotArea * 0.12);
  const maxArea = Math.max(20, expectedDotArea * 4.5);
  const queue = [];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const start = y * width + x;
      if (!mask[start] || seen[start]) continue;

      let area = 0;
      let sumX = 0;
      let sumY = 0;
      let minX = x;
      let maxX = x;
      let minY = y;
      let maxY = y;
      queue.length = 0;
      queue.push(start);
      seen[start] = 1;

      for (let qi = 0; qi < queue.length; qi += 1) {
        const idx = queue[qi];
        const px = idx % width;
        const py = Math.floor(idx / width);
        area += 1;
        sumX += px;
        sumY += py;
        if (px < minX) minX = px;
        if (px > maxX) maxX = px;
        if (py < minY) minY = py;
        if (py > maxY) maxY = py;

        const neighbors = [idx - 1, idx + 1, idx - width, idx + width];
        for (const next of neighbors) {
          if (next < 0 || next >= mask.length || seen[next] || !mask[next]) continue;
          const nx = next % width;
          if (Math.abs(nx - px) > 1) continue;
          seen[next] = 1;
          queue.push(next);
        }
      }

      const boxW = maxX - minX + 1;
      const boxH = maxY - minY + 1;
      const aspect = boxW / Math.max(1, boxH);
      const fill = area / Math.max(1, boxW * boxH);
      if (area >= minArea && area <= maxArea && aspect > 0.45 && aspect < 2.2 && fill > 0.18) {
        dots.push({
          x: sumX / area,
          y: sumY / area,
          minX,
          minY,
          maxX,
          maxY,
          radius: Math.sqrt(area / Math.PI),
          area
        });
      }
    }
  }

  return dots;
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function autoFitGridToDots(dots) {
  if (dots.length < 4) return;
  const nearest = [];
  for (const dot of dots) {
    let best = Infinity;
    for (const other of dots) {
      if (dot === other) continue;
      const dx = dot.x - other.x;
      const dy = dot.y - other.y;
      const distance = Math.hypot(dx, dy);
      if (distance > 3 && distance < best) best = distance;
    }
    if (Number.isFinite(best)) nearest.push(best);
  }
  const pitch = median(nearest);
  if (pitch) {
    const targetPitch = getGridMetrics().dotPitch;
    const currentZoom = Number(controls.imageZoom.value);
    const nextZoom = Math.max(40, Math.min(400, currentZoom * (targetPitch / pitch)));
    controls.imageZoom.value = nextZoom.toFixed(0);
  }
}

function clusterValues(values, tolerance) {
  const sorted = [...values].sort((a, b) => a - b);
  const clusters = [];
  for (const value of sorted) {
    const last = clusters[clusters.length - 1];
    if (!last || Math.abs(last.center - value) > tolerance) {
      clusters.push({ center: value, values: [value] });
    } else {
      last.values.push(value);
      last.center = last.values.reduce((sum, item) => sum + item, 0) / last.values.length;
    }
  }
  return clusters;
}

function splitRowsIntoLines(rowCenters, pitch) {
  const lines = [];
  let current = [];
  for (const row of rowCenters) {
    if (!current.length || row - current[current.length - 1] < pitch * 1.65) {
      current.push(row);
    } else {
      lines.push(current);
      current = [row];
    }
  }
  if (current.length) lines.push(current);
  return lines
    .filter((line) => line.length >= 2)
    .map((line) => {
      const rows = [...line];
      while (rows.length < 3) rows.push(rows[rows.length - 1] + pitch);
      return rows.slice(0, 3);
    });
}

function patternToTextFallback(patterns) {
  let numberMode = false;
  let capNext = false;
  let capWord = false;
  let punctuationPrefix = false;
  let quotePrefix = false;
  let text = "";

  for (let index = 0; index < patterns.length; index += 1) {
    const pattern = patterns[index];
    if (pattern === 0) {
      text += " ";
      numberMode = false;
      capNext = false;
      capWord = false;
      punctuationPrefix = false;
      quotePrefix = false;
      continue;
    }

    if (pattern === UEB_INDICATORS.number) {
      numberMode = true;
      continue;
    }
    if (pattern === UEB_INDICATORS.capital) {
      if (patterns[index + 1] === UEB_INDICATORS.capital) {
        capWord = true;
        capNext = false;
        index += 1;
      } else {
        capNext = true;
      }
      continue;
    }
    if (pattern === UEB_INDICATORS.grade1Symbol) {
      numberMode = false;
      continue;
    }
    if (pattern === UEB_INDICATORS.punctuation) {
      punctuationPrefix = true;
      continue;
    }
    if (pattern === UEB_INDICATORS.quote) {
      quotePrefix = true;
      continue;
    }

    if (punctuationPrefix) {
      text += UEB_PUNCTUATION_PREFIX_SYMBOLS[pattern] || "?";
      punctuationPrefix = false;
      numberMode = false;
      capNext = false;
      capWord = false;
      continue;
    }

    if (quotePrefix) {
      text += UEB_QUOTE_PREFIX_SYMBOLS[pattern] || "?";
      quotePrefix = false;
      numberMode = false;
      capNext = false;
      capWord = false;
      continue;
    }

    let char = UEB_GRADE1_SYMBOLS[pattern] || "?";
    if (numberMode && UEB_GRADE1_NUMBERS[char]) {
      char = UEB_GRADE1_NUMBERS[char];
    } else if (!/[,;:.?!'"-]/.test(char)) {
      numberMode = false;
    }
    if ((capNext || capWord) && /[a-z]/.test(char)) {
      char = char.toUpperCase();
      capNext = false;
    } else if (!/[a-z]/.test(char) && !/['-]/.test(char)) {
      capWord = false;
    }
    text += char;
  }

  return text.replace(/ +([,;:.?!])/g, "$1");
}

async function patternToText(patterns) {
  const selectedTable = getSelectedTranslationTable();
  if (window.liblouisEngine) {
    try {
      return await window.liblouisEngine.backTranslatePatterns(patterns, selectedTable.table);
    } catch (error) {
      setEngineStatus("error", "Translation engine: local fallback");
      console.warn("Liblouis back-translation failed; using local fallback table.", error);
    }
  }

  if (selectedTable.id !== "ueb-g1") {
    return `[${selectedTable.label} unavailable in fallback] ${patternToTextFallback(patterns)}`;
  }

  return patternToTextFallback(patterns);
}

function mirrorDots(dots, width) {
  return dots.map((dot) => ({
    ...dot,
    x: width - dot.x,
    minX: width - dot.maxX,
    maxX: width - dot.minX
  }));
}

function mirrorCells(cells, width) {
  return cells.map((cell) => ({
    ...cell,
    box: {
      ...cell.box,
      x: width - cell.box.x - cell.box.width
    }
  }));
}

function getGridOrigin(dots, metrics) {
  if (!dots.length) return { x: metrics.dotPitch, y: metrics.dotPitch };
  return {
    x: Math.min(...dots.map((dot) => dot.x)),
    y: Math.min(...dots.map((dot) => dot.y))
  };
}

async function translateDots(dots) {
  const metrics = getGridMetrics();
  const origin = getGridOrigin(dots, metrics);
  const tolerance = metrics.dotPitch * 0.48;
  const lineMap = new Map();
  const cells = [];

  for (const dot of dots) {
    const lineIndex = Math.round((dot.y - origin.y) / metrics.linePitch);
    const lineY = origin.y + lineIndex * metrics.linePitch;
    const row = Math.round((dot.y - lineY) / metrics.dotPitch);
    if (row < 0 || row > 2 || Math.abs(dot.y - (lineY + row * metrics.dotPitch)) > tolerance) continue;

    const cellIndex = Math.max(0, Math.floor((dot.x - origin.x + metrics.cellPitch * 0.2) / metrics.cellPitch));
    const cellX = origin.x + cellIndex * metrics.cellPitch;
    const col = Math.abs(dot.x - (cellX + metrics.dotPitch)) < Math.abs(dot.x - cellX) ? 1 : 0;
    if (Math.abs(dot.x - (cellX + col * metrics.dotPitch)) > tolerance) continue;

    if (!lineMap.has(lineIndex)) lineMap.set(lineIndex, new Map());
    const rowMap = lineMap.get(lineIndex);
    rowMap.set(cellIndex, (rowMap.get(cellIndex) || 0) | (1 << (col * 3 + row)));
  }

  const pageLines = [];
  let cellsSeen = 0;
  const sortedLines = [...lineMap.entries()].sort((a, b) => a[0] - b[0]);

  for (const [lineIndex, rowMap] of sortedLines) {
    const maxCell = Math.max(...rowMap.keys());
    const patterns = [];
    for (let cellIndex = 0; cellIndex <= maxCell; cellIndex += 1) {
      const pattern = rowMap.get(cellIndex) || 0;
      patterns.push(pattern);
      if (pattern) {
        cells.push({
          pattern,
          box: {
            x: origin.x + cellIndex * metrics.cellPitch - metrics.dotPitch * 0.55,
            y: origin.y + lineIndex * metrics.linePitch - metrics.dotPitch * 0.65,
            width: metrics.dotPitch * 2.1,
            height: metrics.dotPitch * 3.3
          }
        });
      }
    }

    cellsSeen += patterns.length;
    pageLines.push(await patternToText(patterns));
  }

  return {
    text: pageLines.join("\n"),
    cellsSeen,
    cells,
    origin,
    metrics
  };
}

function drawCellOverlay(cells, color = "#0f766e", fill = "rgba(15, 118, 110, 0.08)") {
  if (!controls.showBoxes.checked) return;
  ctx.save();
  ctx.lineWidth = Math.max(2, canvas.width / 700);
  ctx.strokeStyle = color;
  ctx.fillStyle = fill;
  for (const cell of cells) {
    const { x, y, width, height } = cell.box;
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);
  }
  ctx.restore();
}

function drawStandardGrid(dots, color = "rgba(23, 32, 27, 0.26)") {
  if (!controls.showBoxes.checked) return;
  const metrics = getGridMetrics();
  const origin = getGridOrigin(dots, metrics);
  const maxLines = Math.ceil((canvas.height - origin.y) / metrics.linePitch) + 1;
  const maxCells = Math.ceil((canvas.width - origin.x) / metrics.cellPitch) + 1;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = "rgba(15, 118, 110, 0.18)";
  ctx.lineWidth = 1;

  for (let line = 0; line < maxLines; line += 1) {
    const y = origin.y + line * metrics.linePitch;
    if (y < -metrics.linePitch || y > canvas.height + metrics.linePitch) continue;
    for (let cell = 0; cell < maxCells; cell += 1) {
      const x = origin.x + cell * metrics.cellPitch;
      if (x < -metrics.cellPitch || x > canvas.width + metrics.cellPitch) continue;
      ctx.strokeRect(
        x - metrics.dotPitch * 0.55,
        y - metrics.dotPitch * 0.65,
        metrics.dotPitch * 2.1,
        metrics.dotPitch * 3.3
      );
      for (let row = 0; row < 3; row += 1) {
        for (let col = 0; col < 2; col += 1) {
          ctx.beginPath();
          ctx.arc(x + col * metrics.dotPitch, y + row * metrics.dotPitch, Math.max(1.5, metrics.dotRadius * 0.45), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }
  ctx.restore();
}

async function processImage({ autoFit = false } = {}) {
  if (!sourceImage) return;
  const runId = ++processRunId;
  statusText.textContent = `${sourceLabel} processing...`;
  fitCanvasToImage(sourceImage);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const mask = getBinaryMask(imageData);
  let dots = detectComponents(mask, canvas.width, canvas.height);
  if (autoFit) {
    const beforeZoom = controls.imageZoom.value;
    autoFitGridToDots(dots);
    syncReadouts();
    if (controls.imageZoom.value !== beforeZoom) {
      fitCanvasToImage(sourceImage);
      const fittedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      dots = detectComponents(getBinaryMask(fittedImageData), canvas.width, canvas.height);
    }
  }
  const primary = await translateDots(dots);
  if (runId !== processRunId) return;
  let output = primary.text;
  let reverseDots = [];
  let totalCells = primary.cellsSeen;

  if (controls.doubleSided.checked) {
    const reversePolarity = controls.polarity.value === "dark" ? "light" : "dark";
    reverseDots = detectComponents(getBinaryMask(imageData, reversePolarity), canvas.width, canvas.height);
    const reverse = await translateDots(mirrorDots(reverseDots, canvas.width));
    if (runId !== processRunId) return;
    totalCells += reverse.cellsSeen;
    output = [
      "Side A",
      primary.text || "(no readable Braille detected)",
      "",
      "Side B",
      reverse.text || "(no readable reverse-side Braille detected)"
    ].join("\n");
    reverse.cells = mirrorCells(reverse.cells, canvas.width);
    drawCellOverlay(reverse.cells, "#b45309", "rgba(180, 83, 9, 0.08)");
  }

  drawStandardGrid(dots);
  drawCellOverlay(primary.cells, "#0f766e", "rgba(15, 118, 110, 0.08)");
  outputText.value = output;
  dotCount.textContent = String(dots.length);
  reverseDotCount.textContent = String(reverseDots.length);
  cellCount.textContent = String(totalCells);
  const engineText = window.liblouisEngine && window.liblouisEngine.ready
    ? ` Liblouis ${window.liblouisEngine.version}; ${getSelectedTranslationTable().label}.`
    : " Local fallback table.";
  statusText.textContent = dots.length ? `${sourceLabel} processed.${engineText}` : "No dots found. Adjust threshold or dot color.";
}

function loadImageFromFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      sourceImage = img;
      sourceLabel = file.name;
      controls.polarity.value = "light";
      controls.threshold.value = "90";
      controls.gridStandard.value = "paper";
      controls.imageZoom.value = "100";
      controls.imageOffsetX.value = "0";
      controls.imageOffsetY.value = "0";
      controls.gridScale.value = "100";
      syncReadouts();
      scheduleProcess({ autoFit: true });
    };
    img.onerror = () => {
      statusText.textContent = "The selected image could not be loaded.";
    };
    img.src = reader.result;
  };
  reader.onerror = () => {
    statusText.textContent = "The selected file could not be read.";
  };
  reader.readAsDataURL(file);
}

function makeDemoImage() {
  const img = new Image();
  img.onload = () => {
    sourceImage = img;
    sourceLabel = "demo-braille.png";
    controls.polarity.value = "dark";
    controls.doubleSided.checked = false;
    controls.showBoxes.checked = true;
    controls.threshold.value = "120";
    controls.gridStandard.value = "paper";
    controls.imageZoom.value = "100";
    controls.imageOffsetX.value = "0";
    controls.imageOffsetY.value = "0";
    controls.gridScale.value = "100";
    syncReadouts();
    scheduleProcess({ autoFit: true });
  };
  img.onerror = () => {
    statusText.textContent = "Demo image could not be loaded.";
  };
  img.src = "demo-braille.png";
}

function drawEmptyState() {
  canvas.width = 1200;
  canvas.height = 800;
  ctx.fillStyle = "#fbfaf5";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#5c6862";
  ctx.font = "36px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Upload a white Braille print scan", canvas.width / 2, canvas.height / 2 - 12);
  ctx.font = "22px system-ui, sans-serif";
  ctx.fillText("Detection boxes will appear here after processing", canvas.width / 2, canvas.height / 2 + 32);
}

imageInput.addEventListener("change", (event) => {
  const [file] = event.target.files;
  if (file) loadImageFromFile(file);
});

document.getElementById("demoButton").addEventListener("click", makeDemoImage);
document.getElementById("autoFitGrid").addEventListener("click", () => scheduleProcess({ autoFit: true }));
document.getElementById("copyButton").addEventListener("click", async () => {
  await navigator.clipboard.writeText(outputText.value);
  statusText.textContent = "Translation copied.";
});

Object.values(controls).forEach((control) => {
  control.addEventListener("input", () => {
    syncReadouts();
    scheduleProcess();
  });
  control.addEventListener("change", () => {
    syncReadouts();
    scheduleProcess();
  });
});

populateTranslationTables();
syncReadouts();
drawEmptyState();
initializeTranslationEngine();
