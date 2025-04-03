import { OrderTypeAHandler } from "../OrderTypeAHandler";
import { Order } from "../Order";
import { DatabaseService } from "../DatabaseService";
import { FileService } from "../FileService";
import { PriorityCalculator } from "../PriorityCalculator";

describe("OrderTypeAHandler", () => {
    let dbServiceMock: jest.Mocked<DatabaseService>;
    let fileServiceMock: jest.Mocked<FileService>;
    let priorityCalculatorMock: jest.Mocked<PriorityCalculator>;
    let handler: OrderTypeAHandler;

    beforeEach(() => {
        dbServiceMock = {
            updateOrderStatus: jest.fn(),
        } as unknown as jest.Mocked<DatabaseService>;

        fileServiceMock = {
            writeOrderToFile: jest.fn(),
        } as unknown as jest.Mocked<FileService>;

        priorityCalculatorMock = {
            calculate: jest.fn(),
        } as unknown as jest.Mocked<PriorityCalculator>;

        handler = new OrderTypeAHandler(dbServiceMock, fileServiceMock, priorityCalculatorMock);
    });

    it("should write the order to a file using FileService", async () => {
        const order = new Order(1, "A", 100, false, 123);
        await handler.process(order);
        expect(fileServiceMock.writeOrderToFile).toHaveBeenCalledWith(order);
    });

    it("should set the order status to 'exported' if file writing succeeds", async () => {
        const order = new Order(1, "A", 100, false, 123);
        fileServiceMock.writeOrderToFile.mockResolvedValueOnce(undefined);
        await handler.process(order);
        expect(order.status).toBe("exported");
    });

    it("should set the order status to 'export_failed' if file writing fails", async () => {
        const order = new Order(1, "A", 100, false, 123);
        fileServiceMock.writeOrderToFile.mockRejectedValueOnce(new Error("File write error"));
        await handler.process(order);
        expect(order.status).toBe("export_failed");
    });

    it("should calculate the order priority using PriorityCalculator", async () => {
        const order = new Order(1, "A", 300, false, 123);
        priorityCalculatorMock.calculate.mockReturnValueOnce("high");
        await handler.process(order);
        expect(priorityCalculatorMock.calculate).toHaveBeenCalledWith(order.amount);
        expect(order.priority).toBe("high");
    });

    it("should update the order status and priority in the database using DatabaseService", async () => {
        const order = new Order(1, "A", 100, false, 123);
        await handler.process(order);
        expect(dbServiceMock.updateOrderStatus).toHaveBeenCalledWith(order.id, order.status, order.priority);
    });

    it("should handle exceptions gracefully during file writing", async () => {
        const order = new Order(1, "A", 100, false, 123);
        fileServiceMock.writeOrderToFile.mockRejectedValueOnce(new Error("File write error"));
        await expect(handler.process(order)).resolves.not.toThrow();
    });

    it("should ensure all dependencies are called with correct arguments", async () => {
        const order = new Order(1, "A", 200, false, 123);
        priorityCalculatorMock.calculate.mockReturnValueOnce("low");
        await handler.process(order);
        expect(fileServiceMock.writeOrderToFile).toHaveBeenCalledWith(order);
        expect(priorityCalculatorMock.calculate).toHaveBeenCalledWith(order.amount);
        expect(dbServiceMock.updateOrderStatus).toHaveBeenCalledWith(order.id, order.status, order.priority);
    });
});
