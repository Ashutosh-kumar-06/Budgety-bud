import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { AppError } from '../utils/AppError';
import { extractMenuFromImage } from '../services/menuOcrService';
import { categorizeItem, MenuItemType } from '../services/menuCategorizer';

export interface MenuItemDTO {
  name: string;
  price: number;
  type: MenuItemType;
}

const round2 = (value: number): number => Math.round(value * 100) / 100;

/**
 * POST /api/menu-scanner/scan
 *
 * Accepts a multipart/form-data upload with field name "menuImage"
 * (and an optional "budget" field), runs OCR via Tesseract.js,
 * and returns structured menu data: extracted items, price analysis,
 * cheapest/most-expensive items, and the same recommendation shape
 * (bestValue / healthiest / cheapest / comfort) the frontend already expects.
 */
export const scanMenu = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.file) {
    throw new AppError('No menu image uploaded. Please attach an image file.', 400);
  }

  const budgetRaw = req.body?.budget;
  const budget = budgetRaw !== undefined && budgetRaw !== '' ? Number(budgetRaw) : undefined;

  const { rawText, items: rawItems } = await extractMenuFromImage(req.file.buffer);

  if (rawItems.length === 0) {
    throw new AppError(
      'Could not detect any menu items with prices in this image. Try a clearer, well-lit photo.',
      422
    );
  }

  const items: MenuItemDTO[] = rawItems.map((item) => ({
    ...item,
    type: categorizeItem(item.name),
  }));

  const sortedByPrice = [...items].sort((a, b) => a.price - b.price);
  const prices = items.map((item) => item.price);

  const totalItems = items.length;
  const minPrice = sortedByPrice[0].price;
  const maxPrice = sortedByPrice[sortedByPrice.length - 1].price;
  const averagePrice = round2(prices.reduce((sum, p) => sum + p, 0) / totalItems);

  const healthyItems = items.filter((item) => item.type === 'healthy');
  const comfortItems = items.filter((item) => item.type === 'comfort');

  const cheapest = sortedByPrice[0];

  const healthiest =
    [...healthyItems].sort((a, b) => a.price - b.price)[0] ?? sortedByPrice[0];

  const bestValue =
    (budget !== undefined && !isNaN(budget)
      ? items.find((item) => item.price <= budget && item.type === 'healthy')
      : undefined) ??
    healthyItems[0] ??
    sortedByPrice[1] ??
    sortedByPrice[0];

  const comfortPick =
    comfortItems[0] ?? sortedByPrice[Math.min(2, sortedByPrice.length - 1)];

  const cheapestItems = sortedByPrice.slice(0, 3);
  const mostExpensiveItems = [...sortedByPrice].reverse().slice(0, 3);

  res.status(200).json({
    status: 'success',
    data: {
      items,
      recommendations: {
        bestValue,
        healthiest,
        cheapest,
        comfort: comfortPick,
      },
      priceAnalysis: {
        totalItems,
        averagePrice,
        minPrice,
        maxPrice,
        priceRange: round2(maxPrice - minPrice),
      },
      cheapestItems,
      mostExpensiveItems,
      rawText,
    },
  });
};