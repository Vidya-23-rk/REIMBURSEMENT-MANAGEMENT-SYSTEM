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
        logger: () => {}, // Suppress progress logs
      });

      const text = data.text;
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

    // Extract amount — look for currency symbols followed by numbers
    const amountPatterns = [
      /(?:total|amount|sum|due|grand total)[:\s]*[₹$€£]?\s*(\d{1,3}(?:[,.]?\d{3})*(?:\.\d{2})?)/i,
      /[₹$€£]\s*(\d{1,3}(?:[,.]?\d{3})*(?:\.\d{2})?)/,
      /(\d{1,3}(?:,\d{3})*\.\d{2})/,
    ];

    for (const pattern of amountPatterns) {
      const match = text.match(pattern);
      if (match) {
        result.amount = parseFloat(match[1].replace(/,/g, ''));
        break;
      }
    }

    // Extract currency
    if (text.includes('₹') || /INR|rupee/i.test(text)) result.currency = 'INR';
    else if (text.includes('$') || /USD|dollar/i.test(text)) result.currency = 'USD';
    else if (text.includes('€') || /EUR|euro/i.test(text)) result.currency = 'EUR';
    else if (text.includes('£') || /GBP|pound/i.test(text)) result.currency = 'GBP';

    // Extract date
    const datePatterns = [
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
      /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/,
      /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})/i,
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        result.date = match[1];
        break;
      }
    }

    // Extract vendor (first line is usually the store name)
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
    if (lines.length > 0) {
      result.vendor = lines[0].substring(0, 100);
    }

    // Auto-categorize
    const categoryMap: Record<string, string[]> = {
      'food': ['restaurant', 'cafe', 'food', 'meal', 'lunch', 'dinner', 'breakfast', 'pizza', 'burger'],
      'travel': ['uber', 'ola', 'taxi', 'cab', 'flight', 'airline', 'hotel', 'booking', 'train'],
      'office': ['staples', 'office', 'supply', 'stationery', 'paper', 'ink', 'printer'],
      'software': ['license', 'subscription', 'saas', 'cloud', 'hosting', 'domain'],
      'equipment': ['laptop', 'monitor', 'keyboard', 'mouse', 'hardware', 'electronic'],
    };

    const lowerText = text.toLowerCase();
    for (const [category, keywords] of Object.entries(categoryMap)) {
      if (keywords.some(kw => lowerText.includes(kw))) {
        result.category = category;
        break;
      }
    }

    // Description — first meaningful line after vendor
    result.description = lines.slice(0, 3).join(' | ').substring(0, 255);

    return result;
  }
}

export const ocrService = new OcrService();
