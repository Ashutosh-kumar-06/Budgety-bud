import api from './api';

export type MenuItemType = 'healthy' | 'comfort' | 'spicy' | 'sweet' | 'other';

export interface ScannedMenuItem {
  name: string;
  price: number;
  type: MenuItemType;
}

export interface MenuScanRecommendations {
  bestValue: ScannedMenuItem;
  healthiest: ScannedMenuItem;
  cheapest: ScannedMenuItem;
  comfort: ScannedMenuItem;
}

export interface MenuPriceAnalysis {
  totalItems: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  priceRange: number;
}

export interface MenuScanData {
  items: ScannedMenuItem[];
  recommendations: MenuScanRecommendations;
  priceAnalysis: MenuPriceAnalysis;
  cheapestItems: ScannedMenuItem[];
  mostExpensiveItems: ScannedMenuItem[];
}

export const menuScannerService = {
  /**
   * Uploads a menu image to the backend OCR endpoint and returns
   * structured menu data (extracted items, price analysis, and
   * best-value / healthiest / cheapest / comfort recommendations).
   */
  async scanMenu(file: File, budget?: number): Promise<MenuScanData> {
    const formData = new FormData();
    formData.append('menuImage', file);
    if (budget != null) {
      formData.append('budget', String(budget));
    }

    const response = await api.post<{ status: string; data: MenuScanData }>(
      '/menu-scanner/scan',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    return response.data.data;
  },
};