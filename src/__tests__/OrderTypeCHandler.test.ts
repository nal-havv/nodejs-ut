import { OrderTypeCHandler } from "../OrderTypeCHandler";
import { DatabaseService } from "../DatabaseService";
import { PriorityCalculator } from "../PriorityCalculator";
import { Order } from "../Order";
import { jest } from "@jest/globals";

describe("OrderTypeCHandler", () => {
    let dbServiceMock: jest.Mocked<DatabaseService>;
    let priorityCalculatorMock: jest.Mocked<PriorityCalculator>;
    let handler: OrderTypeCHandler;

    beforeEach(() => {
        dbServiceMock = {
            updateOrderStatus: jest.fn(),
            getOrdersByUser: jest.fn(),
        };
        priorityCalculatorMock = {
            calculate: jest.fn(),
        };
        handler = new OrderTypeCHandler(dbServiceMock, priorityCalculatorMock);
    });

    it("should set status to 'completed' when flag is true", async () => {
        const order = new Order(1, "C", 100, true, 1);
        priorityCalculatorMock.calculate.mockReturnValue("low");

        await handler.process(order);

        expect(order.status).toBe("completed");
        expect(order.priority).toBe("low");
        expect(dbServiceMock.updateOrderStatus).toHaveBeenCalledWith(order.id, "completed", "low");
    });

    it("should set status to 'in_progress' when flag is false", async () => {
        const order = new Order(1, "C", 100, false, 1);
        priorityCalculatorMock.calculate.mockReturnValue("low");

        await handler.process(order);

        expect(order.status).toBe("in_progress");
        expect(order.priority).toBe("low");
        expect(dbServiceMock.updateOrderStatus).toHaveBeenCalledWith(order.id, "in_progress", "low");
    });

    it("should calculate priority using PriorityCalculator", async () => {
        const order = new Order(1, "C", 250, false, 1);
        priorityCalculatorMock.calculate.mockReturnValue("high");

        await handler.process(order);

        expect(priorityCalculatorMock.calculate).toHaveBeenCalledWith(order.amount);
        expect(order.priority).toBe("high");
    });

    it("should call updateOrderStatus with correct parameters", async () => {
        const order = new Order(1, "C", 150, true, 1);
        priorityCalculatorMock.calculate.mockReturnValue("medium");

        await handler.process(order);

        expect(dbServiceMock.updateOrderStatus).toHaveBeenCalledWith(order.id, "completed", "medium");
    });

    it("should not modify the order object before calling updateOrderStatus", async () => {
        const order = new Order(1, "C", 200, false, 1);
        const originalOrder = { ...order };
        priorityCalculatorMock.calculate.mockReturnValue("high");

        await handler.process(order);

        expect(order.id).toBe(originalOrder.id);
        expect(order.type).toBe(originalOrder.type);
        expect(order.amount).toBe(originalOrder.amount);
    });

    it("should handle errors thrown by DatabaseService gracefully", async () => {
        const order = new Order(1, "C", 300, true, 1);
        priorityCalculatorMock.calculate.mockReturnValue("critical");
        dbServiceMock.updateOrderStatus.mockRejectedValue(new Error("Database error"));

        await expect(handler.process(order)).rejects.toThrow("Database error");
    });

    it("should handle errors thrown by PriorityCalculator gracefully", async () => {
        const order = new Order(1, "C", 400, false, 1);
        priorityCalculatorMock.calculate.mockImplementation(() => {
            throw new Error("Priority calculation error");
        });

        await expect(handler.process(order)).rejects.toThrow("Priority calculation error");
    });
});
