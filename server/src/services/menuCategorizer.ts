/**
 * Lightweight keyword-based categorizer for menu items.
 *
 * This mirrors the categories used by the original mock data
 * (`healthy`, `comfort`, `spicy`, `sweet`) so the existing frontend
 * recommendation cards (Best Value / Healthiest / Cheapest / Comfort Choice)
 * continue to work unchanged with real OCR-extracted items.
 */

export type MenuItemType = 'healthy' | 'comfort' | 'spicy' | 'sweet' | 'other';

const KEYWORD_MAP: Record<Exclude<MenuItemType, 'other'>, string[]> = {
  healthy: [
    'salad', 'fruit', 'thali', 'dosa', 'idli', 'idly', 'poha', 'sprout',
    'soup', 'grilled', 'boiled egg', 'juice', 'smoothie', 'oats', 'upma',
    'sambar', 'curd', 'yogurt', 'khichdi', 'vegetable',
  ],
  comfort: [
    'maggi', 'noodle', 'roll', 'samosa', 'chai', 'tea', 'paratha', 'parantha',
    'fries', 'burger', 'pizza', 'sandwich', 'momo', 'bun', 'pakora', 'pakoda',
    'vada', 'bread',
  ],
  spicy: [
    'biryani', 'curry', 'masala', 'chilli', 'chili', 'tikka', 'spicy',
    'pepper', 'tandoori', 'chettinad', 'pickle',
  ],
  sweet: [
    'ice cream', 'icecream', 'cake', 'sweet', 'gulab jamun', 'jamun',
    'halwa', 'kheer', 'coffee', 'shake', 'rasgulla', 'jalebi', 'barfi',
    'ladoo', 'laddu', 'pastry', 'milkshake', 'lassi',
  ],
};

/**
 * Best-effort classification of a menu item name into a broad category.
 * Falls back to 'other' when nothing matches.
 */
export function categorizeItem(name: string): MenuItemType {
  const lower = name.toLowerCase();

  for (const [type, keywords] of Object.entries(KEYWORD_MAP) as [
    Exclude<MenuItemType, 'other'>,
    string[],
  ][]) {
    if (keywords.some((keyword) => lower.includes(keyword))) {
      return type;
    }
  }

  return 'other';
}