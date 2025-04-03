import { DatabaseService } from "./DatabaseService";
import { APIClient } from "./APIClient";
import { OrderHandler } from "./OrderHandler";
import { OrderTypeAHandler } from "./OrderTypeAHandler";
import { OrderTypeBHandler } from "./OrderTypeBHandler";
import { OrderTypeCHandler } from "./OrderTypeCHandler";
import { PriorityCalculator } from "./PriorityCalculator";
import { FileService } from "./FileService";

export class OrderHandlerFactory {
    private readonly dbService: DatabaseService;
    private readonly apiClient: APIClient;
    private readonly priorityCalculator: PriorityCalculator;
    private readonly fileService: FileService;

    constructor(dbService: DatabaseService, apiClient: APIClient, priorityCalculator: PriorityCalculator, fileService: FileService) {
        this.dbService = dbService;
        this.apiClient = apiClient;
        this.priorityCalculator = priorityCalculator;
        this.fileService = fileService;
    }

    getDatabaseService(): DatabaseService {
        return this.dbService;
    }

    getHandler(orderType: string): OrderHandler {
        switch (orderType) {
            case 'A':
                return new OrderTypeAHandler(this.dbService, this.fileService, this.priorityCalculator);
            case 'B':
                return new OrderTypeBHandler(this.dbService, this.apiClient, this.priorityCalculator);
            case 'C':
                return new OrderTypeCHandler(this.dbService, this.priorityCalculator);
            default:
                throw new Error(`Unknown order type: ${orderType}`);
        }
    }
}
