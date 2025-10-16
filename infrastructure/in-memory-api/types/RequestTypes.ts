 // Types pour les requêtes API

export interface CreateAccountRequest {
  ownerId: number;
  countryCode: string;
  bankCode: string;
  branchCode: string;
  ribKey: string;
}

export interface CreateSavingsAccountRequest {
  ownerId: number;
  initialAmount: number;
  countryCode: string;
  bankCode: string;
  branchCode: string;
  ribKey: string;
}

export interface CreateTransferRequest {
  senderFirstName: string;
  senderLastName: string;
  senderIban: string;
  receiverFirstName: string;
  receiverLastName: string;
  receiverIban: string;
  amount: number;
  reason?: string;
  instantTransfer?: boolean;
}

export interface CreateOrderRequest {
  clientId: number;
  stockSymbol: string;
  orderType: "BUY" | "SELL";
  quantity: number;
  price: number;
}

export interface CreateCreditRequest {
  clientId: number;
  principalAmount: number;
  annualInterestRate: number;
  insuranceRate: number;
  termMonths: number;
}

export interface ProcessPaymentRequest {
  creditId: number;
  paymentAmount: number;
}

export interface SendMessageRequest {
  senderId: number;
  receiverId: number;
  subject: string;
  message: string;
}

export interface UpdateInterestRateRequest {
  newRate: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  address: string;
  role: "CLIENT" | "ADVISE" | "DIRECTOR";
}

// Types pour les paramètres de requête
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

export interface FilterParams {
  status?: string;
  type?: string;
  ownerId?: number;
}
