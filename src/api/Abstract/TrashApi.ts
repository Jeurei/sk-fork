import {
  TAddress,
  TRoute,
  TCoords,
  OrderState,
  Crew,
  Car,
  TCustomizableAddress,
} from "@model";
import { CreateOrderParams } from "./CreateOrderParams";
import { UpdateOrderParams } from "./UpdateOrderParams";

export { CreateOrderParams } from "./CreateOrderParams";
export { UpdateOrderParams } from "./UpdateOrderParams";

export type TmReponse<T> = {
  code: number;
  descr: string;
  data: T;
};

export abstract class AbstractTrashApi {
  // public abstract async custom<T = any>(type: 'GET' | 'POST.url' | 'POST.json', method: string, payload: any): Promise<T>;
  public abstract async getAddressesLike2(
    city: string,
    street: string
  ): Promise<TAddress[]>;
  public abstract async analyzeRoute2(
    route: TAddress[],
    get_full_route_coords: boolean
  ): Promise<TRoute>;
  public abstract async analyzeRoute2(
    route: TCustomizableAddress[],
    get_full_route_coords: boolean
  ): Promise<TRoute<TCustomizableAddress>>;
  public abstract async selectTariffForOrder(
    crewGroupId: number,
    addresses: TCoords[]
  ): Promise<number>;
  public abstract async calcOrderCost2(
    tariffId: number,
    route: TRoute,
    orderParams: number[]
  ): Promise<number>;
  public abstract async calcOrderCost2WithoutRoute(
    tariffId: number,
    addresses: TAddress[],
    orderParams: number[]
  ): Promise<number>;

  public abstract async createOrder2(
    request: CreateOrderParams
  ): Promise<number>;
  public abstract async updateOrder(request: UpdateOrderParams): Promise<void>;
  public abstract async getCurrentOrdersByClientId(
    clientId: number
  ): Promise<number[]>;
  public abstract async getOrderState(orderId: number): Promise<OrderState>;
  public abstract async changeOrderState(
    orderId: number,
    newStateId: number
  ): Promise<void>;
  public abstract async getCrewInfo(crewId: number): Promise<Crew<null>>;
  public abstract async getCarInfo(carId: number): Promise<Car>;
  public abstract async getClientBonuses(tel: string): Promise<any>;
  public abstract async getInfoByOrderId(
    orderId: number,
    fields: string[]
  ): Promise<{
    DISCOUNTEDSUMM?: string;
    DRIVER_TIMECOUNT?: string;
  }>;
  public abstract sendPincode(pin: number, tel: string): void;
  public abstract async connectClientAndDriver(orderId: number): Promise<void>;

  public abstract async callDispatcher(phone: string): Promise<void>;
}
