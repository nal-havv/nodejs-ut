import { OrderProcessingService } from "../OrderProcessingService";
import { OrderHandlerFactory } from "../OrderHandlerFactory";
import { DatabaseService } from "../DatabaseService";
import { Order } from "../Order";
import { OrderHandler } from "../OrderHandler";

describe("OrderProcessingService", () => {
    let orderHandlerFactoryMock: jest.Mocked<OrderHandlerFactory>;
    let databaseServiceMock: jest.Mocked<DatabaseService>;
    let orderHandlerMock: jest.Mocked<OrderHandler>;
    let service: OrderProcessingService;

    beforeEach(() => {
        databaseServiceMock = {
            getOrdersByUser: jest.fn(),
        } as unknown as jest.Mocked<DatabaseService>;

        orderHandlerMock = {
            process: jest.fn(),
        } as unknown as jest.Mocked<OrderHandler>;

        orderHandlerFactoryMock = {
            getDatabaseService: jest.fn().mockReturnValue(databaseServiceMock),
            getHandler: jest.fn().mockReturnValue(orderHandlerMock),
        } as unknown as jest.Mocked<OrderHandlerFactory>;

        service = new OrderProcessingService(orderHandlerFactoryMock);
    });

    it("should process all orders for a user", async () => {
        const orders = [
            new Order(1, "A", 100, false, 123),
            new Order(2, "B", 200, true, 123),
        ];
        databaseServiceMock.getOrdersByUser.mockResolvedValueOnce(orders);

        await service.processOrders(123);

        expect(databaseServiceMock.getOrdersByUser).toHaveBeenCalledWith(123);
        expect(orderHandlerFactoryMock.getHandler).toHaveBeenCalledTimes(2);
        expect(orderHandlerMock.process).toHaveBeenCalledTimes(2);
    });

    it("should return false if an error occurs during processing", async () => {
        databaseServiceMock.getOrdersByUser.mockRejectedValueOnce(new Error("Database error"));

        const result = await service.processOrders(123);

        expect(result).toBe(false);
        expect(databaseServiceMock.getOrdersByUser).toHaveBeenCalledWith(123);
    });

    it("should call the correct handler based on order type", async () => {
        const orders = [
            new Order(1, "A", 100, false, 123),
            new Order(2, "B", 200, true, 123),
        ];
        databaseServiceMock.getOrdersByUser.mockResolvedValueOnce(orders);

        await service.processOrders(123);

        expect(orderHandlerFactoryMock.getHandler).toHaveBeenCalledWith("A");
        expect(orderHandlerFactoryMock.getHandler).toHaveBeenCalledWith("B");
    });

    it("should handle an empty list of orders gracefully", async () => {
        databaseServiceMock.getOrdersByUser.mockResolvedValueOnce([]);

        const result = await service.processOrders(123);

        expect(result).toEqual([]);
        expect(orderHandlerFactoryMock.getHandler).not.toHaveBeenCalled();
        expect(orderHandlerMock.process).not.toHaveBeenCalled();
    });

    it("should handle a mix of order types correctly", async () => {
        const orders = [
            new Order(1, "A", 100, false, 123),
            new Order(2, "B", 200, true, 123),
            new Order(3, "C", 300, false, 123),
        ];
        databaseServiceMock.getOrdersByUser.mockResolvedValueOnce(orders);

        await service.processOrders(123);

        expect(orderHandlerFactoryMock.getHandler).toHaveBeenCalledWith("A");
        expect(orderHandlerFactoryMock.getHandler).toHaveBeenCalledWith("B");
        expect(orderHandlerFactoryMock.getHandler).toHaveBeenCalledWith("C");
        expect(orderHandlerMock.process).toHaveBeenCalledTimes(3);
    });

    it("should not process orders if the database service fails", async () => {
        databaseServiceMock.getOrdersByUser.mockRejectedValueOnce(new Error("Database error"));

        const result = await service.processOrders(123);

        expect(result).toBe(false);
        expect(orderHandlerFactoryMock.getHandler).not.toHaveBeenCalled();
        expect(orderHandlerMock.process).not.toHaveBeenCalled();
    });

    it("should handle exceptions thrown by handlers gracefully", async () => {
        const orders = [new Order(1, "A", 100, false, 123)];
        databaseServiceMock.getOrdersByUser.mockResolvedValueOnce(orders);
        orderHandlerMock.process.mockRejectedValueOnce(new Error("Handler error"));

        const result = await service.processOrders(123);

        expect(result).toBe(false);
        expect(orderHandlerFactoryMock.getHandler).toHaveBeenCalledWith("A");
        expect(orderHandlerMock.process).toHaveBeenCalledTimes(1);
    });

    it("should skip processing for invalid order types", async () => {
        const orders = [new Order(1, "InvalidType", 100, false, 123)];
        databaseServiceMock.getOrdersByUser.mockResolvedValueOnce(orders);
        orderHandlerFactoryMock.getHandler.mockImplementation(() => {
            throw new Error("Unknown order type");
        });

        const result = await service.processOrders(123);

        expect(result).toBe(false);
        expect(orderHandlerFactoryMock.getHandler).toHaveBeenCalledWith("InvalidType");
        expect(orderHandlerMock.process).not.toHaveBeenCalled();
    });
});
