import { PortfolioDto, StockHoldingDto } from '@/shared/dto';

export interface PortfolioServiceInterface {
  getPortfolio(userId: number): Promise<PortfolioDto | Error>;
  getHoldingBySymbol(userId: number, stockSymbol: string): Promise<StockHoldingDto | Error>;
}

