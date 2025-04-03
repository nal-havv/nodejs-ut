import { Order } from "./Order";
import { OrderHandlerFactory } from "./OrderHandlerFactory";

export class OrderProcessingService {
    private readonly orderHandlerFactory: OrderHandlerFactory;

    constructor(orderHandlerFactory: OrderHandlerFactory) {
        this.orderHandlerFactory = orderHandlerFactory;
    }

    async processOrders(userId: number): Promise<Order[] | false> {
        try {
            const orders = await this.orderHandlerFactory.getDatabaseService().getOrdersByUser(userId);

            for (const order of orders) {
                const handler = this.orderHandlerFactory.getHandler(order.type);
                await handler.process(order);
            }

            return orders;
        } catch (error) {
            return false;
        }
    }
}