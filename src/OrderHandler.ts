import { Order } from "./Order";

export interface OrderHandler {
    process(order: Order): Promise<void>;
}
