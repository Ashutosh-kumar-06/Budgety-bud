import { createWorker, Worker } from 'tesseract.js';

export interface ExtractedMenuItem {
  name: string;
  price: number;
}

export interface OcrResult {
  rawText: string;
  items: ExtractedMenuItem[];
}

/**
 * Matches a trailing price on a menu line, e.g.:
 *   "Masala Dosa        ₹50"
 *   "Veg Thali - Rs. 80"
 *   "Chicken Biryani  120/-"
 *   "Cold Coffee   INR 40.00"
 *   "Chai 15"
 */
const PRICE_REGEX = /(?:₹|Rs\.?|INR)?\s*([0-9]{1,4}(?:[.,][0-9]{1,2})?)\s*(?:\/-)?\s*$/i;

/** Lines that are clearly not menu items (headers, addresses, phone numbers, etc.) */
const IGNORE_LINE_REGEX = /^(menu|price list|rate list|item|items|s\.?\s?no\.?|sl\.?\s?no\.?|qty|quantity|name|description|total|grand total|tel|phone|contact|address|gst|fssai)\b/i;

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Parses raw OCR text into a de-duplicated list of menu items with prices.
 * Each line is checked for a trailing price; everything before the price
 * (minus separators like dots/dashes) is treated as the item name.
 */
export function parseMenuText(rawText: string): ExtractedMenuItem[] {
  const items: ExtractedMenuItem[] = [];

  const lines = rawText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (line.length < 3) continue;
    if (IGNORE_LINE_REGEX.test(line)) continue;

    const match = line.match(PRICE_REGEX);
    if (!match) continue;

    const priceStr = match[1].replace(',', '.');
    const price = parseFloat(priceStr);
    if (isNaN(price) || price <= 0 || price > 100000) continue;

    let name = line.slice(0, match.index).trim();
    // Strip leading bullet/numbering and trailing separators (dots, dashes, colons, pipes)
    name = name
      .replace(/^[\d.\-)\s]+/, '')
      .replace(/[\s.\-_:|]+$/, '')
      .trim();

    if (!name || name.length < 2) continue;
    // Skip lines whose "name" portion is itself purely numeric/symbols
    if (/^[\d\s.,/-]+$/.test(name)) continue;

    items.push({ name: toTitleCase(name), price });
  }

  // De-duplicate by name (case-insensitive), keeping the first occurrence
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

let workerPromise: Promise<Worker> | null = null;

/**
 * Lazily creates (and reuses) a single Tesseract.js worker.
 * Tesseract.js queues jobs internally, so a single worker can safely
 * serve sequential requests without re-downloading language data each time.
 */
async function getWorker(): Promise<Worker> {
  if (!workerPromise) {
    workerPromise = createWorker('eng').catch((err) => {
      // Allow a retry on the next request if initialization failed
      workerPromise = null;
      throw err;
    });
  }
  return workerPromise;
}

/**
 * Runs OCR on an image buffer and extracts menu items (name + price).
 */
export async function extractMenuFromImage(imageBuffer: Buffer): Promise<OcrResult> {
  const worker = await getWorker();
  const { data } = await worker.recognize(imageBuffer);
  const items = parseMenuText(data.text);

  return {
    rawText: data.text,
    items,
  };
}

/**
 * Terminates the shared OCR worker. Useful for graceful shutdown / tests.
 */
export async function shutdownOcrWorker(): Promise<void> {
  if (workerPromise) {
    const worker = await workerPromise;
    await worker.terminate();
    workerPromise = null;
  }
}