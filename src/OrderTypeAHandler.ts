import { Order } from "./Order";
import { OrderHandler } from "./OrderHandler";
import { DatabaseService } from "./DatabaseService";
import { FileService } from "./FileService";
import { PriorityCalculator } from "./PriorityCalculator";

export class OrderTypeAHandler implements OrderHandler {
    private readonly dbService: DatabaseService;
    private readonly fileService: FileService;
    private readonly priorityCalculator: PriorityCalculator;

    constructor(dbService: DatabaseService, fileService: FileService, priorityCalculator: PriorityCalculator) {
        this.dbService = dbService;
        this.fileService = fileService;
        this.priorityCalculator = priorityCalculator;
    }

    async process(order: Order): Promise<void> {
        try {
            await this.fileService.writeOrderToFile(order);
            order.status = 'exported';
        } catch {
            order.status = 'export_failed';
        }

        order.priority = this.priorityCalculator.calculate(order.amount);
        await this.dbService.updateOrderStatus(order.id, order.status, order.priority);
    }
}
