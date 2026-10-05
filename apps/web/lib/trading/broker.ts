import type {
  InstrumentSpecification,
  ProtectedOrder,
  OrderState,
} from "./types";
export interface BrokerAccount {
  id: string;
  currency: string;
  balance: number;
  equity: number;
  freeMargin: number;
  demo: boolean;
  healthy: boolean;
}
export interface BrokerOrder {
  id: string;
  clientId: string;
  symbol: string;
  state: OrderState;
  quantity: number;
  filledQuantity: number;
  averagePrice: number | null;
}
export interface PositionSnapshot {
  id: string;
  symbol: string;
  direction: "buy" | "sell";
  quantity: number;
  entry: number;
  stop: number | null;
  target: number | null;
  unrealizedPnl: number;
  updatedAt: string;
}
export interface ExecutionRequest extends ProtectedOrder {
  clientId: string;
  quantity: number;
}
export interface BrokerAdapter {
  readonly provider: "paper" | "metaapi";
  connect(): Promise<BrokerAccount>;
  disconnect(): Promise<void>;
  getAccount(): Promise<BrokerAccount>;
  getPositions(): Promise<PositionSnapshot[]>;
  getOrders(): Promise<BrokerOrder[]>;
  getInstrumentMetadata(symbol: string): Promise<InstrumentSpecification>;
  placeOrder(request: ExecutionRequest): Promise<BrokerOrder>;
  modifyOrder(id: string, stop: number, target: number): Promise<void>;
  cancelOrder(id: string): Promise<void>;
  closePosition(id: string): Promise<void>;
  getOrderStatus(id: string): Promise<BrokerOrder | null>;
  healthCheck(): Promise<boolean>;
}
