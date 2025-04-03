import { OrderHandlerFactory } from "../OrderHandlerFactory";
import { DatabaseService } from "../DatabaseService";
import { APIClient } from "../APIClient";
import { PriorityCalculator } from "../PriorityCalculator";
import { FileService } from "../FileService";
import { OrderTypeAHandler } from "../OrderTypeAHandler";
import { OrderTypeBHandler } from "../OrderTypeBHandler";
import { OrderTypeCHandler } from "../OrderTypeCHandler";

describe("OrderHandlerFactory", () => {
    let dbServiceMock: jest.Mocked<DatabaseService>;
    let apiClientMock: jest.Mocked<APIClient>;
    let priorityCalculatorMock: jest.Mocked<PriorityCalculator>;
    let fileServiceMock: jest.Mocked<FileService>;
    let factory: OrderHandlerFactory;

    beforeEach(() => {
        dbServiceMock = {} as jest.Mocked<DatabaseService>;
        apiClientMock = {} as jest.Mocked<APIClient>;
        priorityCalculatorMock = {} as jest.Mocked<PriorityCalculator>;
        fileServiceMock = {} as jest.Mocked<FileService>;

        factory = new OrderHandlerFactory(dbServiceMock, apiClientMock, priorityCalculatorMock, fileServiceMock);
    });

    it("should return the correct DatabaseService instance", () => {
        const dbService = factory.getDatabaseService();
        expect(dbService).toBe(dbServiceMock);
    });

    it("should return OrderTypeAHandler for type 'A'", () => {
        const handler = factory.getHandler("A");
        expect(handler).toBeInstanceOf(OrderTypeAHandler);
    });

    it("should return OrderTypeBHandler for type 'B'", () => {
        const handler = factory.getHandler("B");
        expect(handler).toBeInstanceOf(OrderTypeBHandler);
    });

    it("should return OrderTypeCHandler for type 'C'", () => {
        const handler = factory.getHandler("C");
        expect(handler).toBeInstanceOf(OrderTypeCHandler);
    });

    it("should throw an error for unknown order types", () => {
        expect(() => factory.getHandler("D")).toThrow("Unknown order type: D");
    });
});
