import Tesseract from 'tesseract.js';

interface OcrResult {
  amount: number | null;
  currency: string | null;
  category: string | null;
  description: string;
  date: string | null;
  vendor: string | null;
  rawText: string;
}

export class OcrService {
  async scanReceipt(imageBuffer: Buffer): Promise<OcrResult> {
    try {
      const { data } = await Tesseract.recognize(imageBuffer, 'eng', {
        logger: () => {},
      });

      const text = data.text;
      console.log('📝 OCR Raw Text:\n', text);
      return this.parseReceiptText(text);
    } catch (error) {
      console.error('❌ OCR Error:', error);
      return {
        amount: null,
        currency: null,
        category: null,
        description: 'OCR failed — enter details manually',
        date: null,
        vendor: null,
        rawText: '',
      };
    }
  }

  private parseReceiptText(text: string): OcrResult {
    const result: OcrResult = {
      amount: null,
      currency: null,
      category: null,
      description: '',
      date: null,
      vendor: null,
      rawText: text,
    };

    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 1);

    // ─── 1. Extract Amount ──────────────────────────────────
    // Strategy: Find labeled amounts FIRST (Total, Grand Total, Amount Due, etc.)
    // Only fall back to scanning all numbers if no labeled amount found

    // Priority 1: Look for specific total labels
    const totalPatterns = [
      /(?:amount\s*to\s*be\s*reimburse?d?)[:\s=]*[₹$€£Rs.]?\s*([\d,]+\.?\d*)/gi,
      /(?:grand\s*total|net\s*total|total\s*expense|total\s*amount|total\s*due|amount\s*due|balance\s*due)[:\s=]*[₹$€£Rs.]?\s*([\d,]+\.?\d*)/gi,
      /(?:^|\s)total[:\s=]*[₹$€£Rs.]?\s*([\d,]+\.?\d*)/gim,
    ];

    let labeledAmounts: { amount: number; priority: number }[] = [];

    for (let i = 0; i < totalPatterns.length; i++) {
      let match;
      while ((match = totalPatterns[i].exec(text)) !== null) {
        const val = parseFloat(match[1].replace(/,/g, ''));
        // Reasonable receipt amount range: ₹1 to ₹10,00,000
        if (val > 0 && val < 1000000) {
          labeledAmounts.push({ amount: val, priority: i });
        }
      }
    }

    if (labeledAmounts.length > 0) {
      // Pick highest priority (lowest index), then largest amount within same priority
      labeledAmounts.sort((a, b) => a.priority - b.priority || b.amount - a.amount);
      result.amount = labeledAmounts[0].amount;
    } else {
      // Fallback: Find amounts with currency symbols (₹1,250.00 pattern)
      const currencyAmounts = [
        ...text.matchAll(/[₹$€£]\s*([\d,]+\.\d{2})/g),
        ...text.matchAll(/Rs\.?\s*([\d,]+\.\d{2})/gi),
      ];

      const validAmounts = currencyAmounts
        .map(m => parseFloat(m[1].replace(/,/g, '')))
        .filter(v => v > 0 && v < 1000000);

      if (validAmounts.length > 0) {
        result.amount = Math.max(...validAmounts);
      } else {
        // Last resort: find numbers with exactly 2 decimal places (price format)
        const decimalAmounts = [...text.matchAll(/([\d,]+\.\d{2})\b/g)]
          .map(m => parseFloat(m[1].replace(/,/g, '')))
          .filter(v => v > 1 && v < 1000000);

        if (decimalAmounts.length > 0) {
          result.amount = Math.max(...decimalAmounts);
        }
      }
    }

    // ─── 2. Extract Currency ──────────────────────────────────
    if (text.includes('₹') || /INR|rupee|Rs\.?/i.test(text)) result.currency = 'INR';
    else if (text.includes('$') || /USD|dollar/i.test(text)) result.currency = 'USD';
    else if (text.includes('€') || /EUR|euro/i.test(text)) result.currency = 'EUR';
    else if (text.includes('£') || /GBP|pound/i.test(text)) result.currency = 'GBP';
    else result.currency = 'INR';

    // ─── 3. Extract Date ──────────────────────────────────────
    const datePatterns = [
      // DD-Mon-YYYY or DD Mon YYYY (18-Apr-2024, 24 April 2024)
      /(\d{1,2}[\s\-](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\-,]*\d{4})/i,
      // Month DD, YYYY (April 24, 2024)
      /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4})/i,
      // DD/MM/YYYY or MM/DD/YYYY
      /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/,
      // YYYY-MM-DD
      /(\d{4}[\/-]\d{1,2}[\/-]\d{1,2})/,
      // DD.MM.YYYY
      /(\d{1,2}\.\d{1,2}\.\d{2,4})/,
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        result.date = this.normalizeDate(match[1]);
        break;
      }
    }

    // ─── 4. Extract Vendor / Company Name ──────────────────
    for (const line of lines) {
      const cleaned = line.replace(/[^a-zA-Z\s&.]/g, '').trim();
      if (
        cleaned.length > 3 &&
        /[a-zA-Z]{3,}/.test(cleaned) &&
        !/^(employee|expense|receipt|date|total|amount|category|description|declaration|approved|signature|purpose)/i.test(cleaned)
      ) {
        result.vendor = cleaned.substring(0, 100);
        break;
      }
    }

    // ─── 5. Extract Description / Purpose ──────────────────
    // Look for "PURPOSE OF EXPENSE" or similar labels
    const purposeMatch = text.match(/(?:purpose\s*(?:of\s*expense)?|subject|reason|for)[:\s]*(.+)/i);
    if (purposeMatch && purposeMatch[1].trim().length > 5) {
      result.description = purposeMatch[1].trim().substring(0, 255);
    } else if (result.vendor) {
      // Try to build description from vendor + first expense line item
      const itemLines = lines.filter(l =>
        /taxi|lunch|travel|hotel|parking|office|food|meeting|client/i.test(l)
      );
      if (itemLines.length > 0) {
        result.description = `${result.vendor} — ${itemLines[0]}`.substring(0, 255);
      } else {
        result.description = result.vendor;
      }
    } else {
      const meaningful = lines.filter(l => l.length > 5 && /[a-zA-Z]{3,}/.test(l));
      result.description = meaningful.slice(0, 2).join(' | ').substring(0, 255);
    }

    // ─── 6. Auto-Categorize ────────────────────────────────
    const categoryMap: Record<string, string[]> = {
      'Travel':          ['uber', 'ola', 'taxi', 'cab', 'flight', 'airline', 'airport', 'boarding', 'train', 'railway', 'bus', 'metro', 'travel'],
      'Meals':           ['restaurant', 'cafe', 'coffee', 'food', 'meal', 'lunch', 'dinner', 'breakfast', 'pizza', 'burger', 'bakery', 'swiggy', 'zomato', 'kitchen', 'dine'],
      'Accommodation':   ['hotel', 'motel', 'inn', 'resort', 'airbnb', 'oyo', 'stay', 'lodge', 'room', 'accommodation'],
      'Transportation':  ['fuel', 'petrol', 'diesel', 'gas', 'parking', 'toll', 'fare'],
      'Office Supplies': ['staples', 'office', 'supply', 'stationery', 'paper', 'ink', 'printer', 'pen', 'notebook'],
      'Software':        ['license', 'subscription', 'saas', 'cloud', 'hosting', 'domain', 'aws', 'azure', 'google'],
      'Hardware':        ['laptop', 'monitor', 'keyboard', 'mouse', 'hardware', 'electronic', 'charger', 'adapter', 'cable'],
      'Communication':   ['phone', 'mobile', 'airtel', 'jio', 'vodafone', 'internet', 'wifi', 'broadband', 'sim'],
      'Training':        ['course', 'training', 'workshop', 'conference', 'seminar', 'certification', 'udemy', 'coursera'],
    };

    const lowerText = text.toLowerCase();
    for (const [category, keywords] of Object.entries(categoryMap)) {
      if (keywords.some(kw => lowerText.includes(kw))) {
        result.category = category;
        break;
      }
    }

    console.log('📊 OCR Parsed:', {
      amount: result.amount,
      currency: result.currency,
      category: result.category,
      date: result.date,
      vendor: result.vendor,
      description: result.description,
    });

    return result;
  }

  /**
   * Normalize various date formats to YYYY-MM-DD for the HTML date input
   */
  private normalizeDate(dateStr: string): string {
    try {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0]; // YYYY-MM-DD
      }
    } catch {}

    // If Date() can't parse, try manual parsing for DD-Mon-YYYY
    const monthMap: Record<string, string> = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
    };

    const match = dateStr.match(/(\d{1,2})[\s\-](\w{3,})[,\s\-]*(\d{4})/i);
    if (match) {
      const day = match[1].padStart(2, '0');
      const month = monthMap[match[2].substring(0, 3).toLowerCase()];
      const year = match[3];
      if (month) return `${year}-${month}-${day}`;
    }

    return dateStr;
  }
}

export const ocrService = new OcrService();
