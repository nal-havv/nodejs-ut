import { Order } from "./Order";
import { OrderHandler } from "./OrderHandler";
import { DatabaseService } from "./DatabaseService";
import { PriorityCalculator } from "./PriorityCalculator";

export class OrderTypeCHandler implements OrderHandler {
    private readonly dbService: DatabaseService;
    private readonly priorityCalculator: PriorityCalculator;

    constructor(dbService: DatabaseService, priorityCalculator: PriorityCalculator) {
        this.dbService = dbService;
        this.priorityCalculator = priorityCalculator;
    }

    async process(order: Order): Promise<void> {
        order.status = order.flag ? 'completed' : 'in_progress';
        order.priority = this.priorityCalculator.calculate(order.amount);
        await this.dbService.updateOrderStatus(order.id, order.status, order.priority);
    }
}
