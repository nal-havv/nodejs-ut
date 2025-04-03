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
            order.status = this.determineOrderStatus(apiResponse.status, apiResponse.data?.amount, order);
        } catch (error) {
            order.status = this.handleAPIError(error);
        }

        order.priority = this.priorityCalculator.calculate(order.amount);
        await this.dbService.updateOrderStatus(order.id, order.status, order.priority);
    }

    private determineOrderStatus(apiStatus: string, apiAmount: number | undefined, order: Order): string {
        if (apiStatus !== 'success') {
            return 'api_error';
        }

        if (apiAmount === undefined) {
            return 'error';
        }

        if (apiAmount >= 50 && order.amount < 100) {
            return 'processed';
        }

        if (apiAmount < 50 || order.flag) {
            return 'pending';
        }

        return 'error';
    }

    private handleAPIError(error: unknown): string {
        if (error instanceof APIException) {
            return 'api_failure';
        }
        return 'unknown_error';
    }
}
