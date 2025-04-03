import { Order } from "./Order";
import { OrderHandler } from "./OrderHandler";
import { DatabaseService } from "./DatabaseService";
import { APIClient } from "./APIClient";
import { APIException } from "./APIException";
import { PriorityCalculator } from "./PriorityCalculator";

export class OrderTypeBHandler implements OrderHandler {
    private readonly dbService: DatabaseService;
    private readonly apiClient: APIClient;
    private readonly priorityCalculator: PriorityCalculator;

    constructor(dbService: DatabaseService, apiClient: APIClient, priorityCalculator: PriorityCalculator) {
        this.dbService = dbService;
        this.apiClient = apiClient;
        this.priorityCalculator = priorityCalculator;
    }

    async process(order: Order): Promise<void> {
        try {
            const apiResponse = await this.apiClient.callAPI(order.id);

            if (apiResponse.status === 'success') {
                if (apiResponse.data.amount >= 50 && order.amount < 100) {
                    order.status = 'processed';
                } else if (apiResponse.data.amount < 50 || order.flag) {
                    order.status = 'pending';
                } else {
                    order.status = 'error';
                }
            } else {
                order.status = 'api_error';
            }
        } catch (error) {
            if (error instanceof APIException) {
                order.status = 'api_failure';
            }
        }

        order.priority = this.priorityCalculator.calculate(order.amount);
        await this.dbService.updateOrderStatus(order.id, order.status, order.priority);
    }
}
