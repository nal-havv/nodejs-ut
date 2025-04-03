import { OrderTypeBHandler } from "../OrderTypeBHandler";
import { Order } from "../Order";
import { DatabaseService } from "../DatabaseService";
import { APIClient } from "../APIClient";
import { APIException } from "../APIException";
import { PriorityCalculator } from "../PriorityCalculator";

describe("OrderTypeBHandler", () => {
    let dbServiceMock: jest.Mocked<DatabaseService>;
    let apiClientMock: jest.Mocked<APIClient>;
    let priorityCalculatorMock: jest.Mocked<PriorityCalculator>;
    let handler: OrderTypeBHandler;

    beforeEach(() => {
        dbServiceMock = {
            updateOrderStatus: jest.fn(),
        } as unknown as jest.Mocked<DatabaseService>;

        apiClientMock = {
            callAPI: jest.fn(),
        } as unknown as jest.Mocked<APIClient>;

        priorityCalculatorMock = {
            calculate: jest.fn(),
        } as unknown as jest.Mocked<PriorityCalculator>;

        handler = new OrderTypeBHandler(dbServiceMock, apiClientMock, priorityCalculatorMock);
    });

    it("should set status to 'processed' when API response is successful and conditions are met", async () => {
        const order = new Order(1, "B", 80, false, 123);
        apiClientMock.callAPI.mockResolvedValueOnce({ status: "success", data: { id: 1, type: "B", amount: 60, flag: false, status: "new", priority: "medium", userId: 12 } });
        priorityCalculatorMock.calculate.mockReturnValueOnce("medium");

        await handler.process(order);

        expect(order.status).toBe("processed");
        expect(order.priority).toBe("medium");
        expect(dbServiceMock.updateOrderStatus).toHaveBeenCalledWith(order.id, "processed", "medium");
    });

    it("should set status to 'pending' when API response is successful but conditions are not met", async () => {
        const order = new Order(2, "B", 40, true, 123);
        apiClientMock.callAPI.mockResolvedValueOnce({ status: "success", data: { id: 2, type: "B", amount: 30, flag: true, status: "new", priority: "low", userId: 123 } });
        priorityCalculatorMock.calculate.mockReturnValueOnce("low");

        await handler.process(order);

        expect(order.status).toBe("pending");
        expect(order.priority).toBe("low");
        expect(dbServiceMock.updateOrderStatus).toHaveBeenCalledWith(order.id, "pending", "low");
    });

    it("should set status to 'error' when API response is successful but no conditions are met", async () => {
        const order = new Order(3, "B", 120, false, 123);
        apiClientMock.callAPI.mockResolvedValueOnce({ status: "success", data: { id: 3, type: "B", amount: 55, flag: false, status: "new", priority: "high", userId: 123 } });
        priorityCalculatorMock.calculate.mockReturnValueOnce("high");

        await handler.process(order);

        expect(order.status).toBe("error");
        expect(order.priority).toBe("high");
        expect(dbServiceMock.updateOrderStatus).toHaveBeenCalledWith(order.id, "error", "high");
    });

    it("should set status to 'api_error' when API response fails", async () => {
        const order = new Order(4, "B", 50, false, 123);
        apiClientMock.callAPI.mockResolvedValueOnce({ status: "failure", data: {} as Order });
        priorityCalculatorMock.calculate.mockReturnValueOnce("low");

        await handler.process(order);

        expect(order.status).toBe("api_error");
        expect(order.priority).toBe("low");
        expect(dbServiceMock.updateOrderStatus).toHaveBeenCalledWith(order.id, "api_error", "low");
    });

    it("should set status to 'api_failure' when APIException is thrown", async () => {
        const order = new Order(5, "B", 70, false, 123);
        apiClientMock.callAPI.mockRejectedValueOnce(new APIException("API error"));
        priorityCalculatorMock.calculate.mockReturnValueOnce("medium");

        await handler.process(order);

        expect(order.status).toBe("api_failure");
        expect(order.priority).toBe("medium");
        expect(dbServiceMock.updateOrderStatus).toHaveBeenCalledWith(order.id, "api_failure", "medium");
    });

    it("should set status to 'processed' when apiAmount is exactly 50 and order.amount is less than 100", async () => {
        const order = new Order(6, "B", 80, false, 123);
        apiClientMock.callAPI.mockResolvedValueOnce({ status: "success", data: { id: 6, type: "B", amount: 50, flag: false, status: "new", priority: "medium", userId: 123 } });
        priorityCalculatorMock.calculate.mockReturnValueOnce("medium");

        await handler.process(order);

        expect(order.status).toBe("processed");
        expect(order.priority).toBe("medium");
        expect(dbServiceMock.updateOrderStatus).toHaveBeenCalledWith(order.id, "processed", "medium");
    });

    it("should set status to 'pending' when apiAmount is exactly 50 but order.flag is true", async () => {
        const order = new Order(7, "B", 180, true, 123);
        apiClientMock.callAPI.mockResolvedValueOnce({ status: "success", data: { id: 7, type: "B", amount: 50, flag: true, status: "new", priority: "medium", userId: 123 } });
        priorityCalculatorMock.calculate.mockReturnValueOnce("medium");

        await handler.process(order);

        expect(order.status).toBe("pending");
        expect(order.priority).toBe("medium");
        expect(dbServiceMock.updateOrderStatus).toHaveBeenCalledWith(order.id, "pending", "medium");
    });

    it("should set status to 'pending' when apiAmount is less than 50", async () => {
        const order = new Order(8, "B", 80, false, 123);
        apiClientMock.callAPI.mockResolvedValueOnce({ status: "success", data: { id: 8, type: "B", amount: 49, flag: false, status: "new", priority: "low", userId: 123 } });
        priorityCalculatorMock.calculate.mockReturnValueOnce("low");

        await handler.process(order);

        expect(order.status).toBe("pending");
        expect(order.priority).toBe("low");
        expect(dbServiceMock.updateOrderStatus).toHaveBeenCalledWith(order.id, "pending", "low");
    });

    it("should set status to 'unknown_error' when an unknown error is thrown", async () => {
        const order = new Order(10, "B", 80, false, 123);
        apiClientMock.callAPI.mockRejectedValueOnce(new Error("Unknown error"));
        priorityCalculatorMock.calculate.mockReturnValueOnce("low");

        await handler.process(order);

        expect(order.status).toBe("unknown_error");
        expect(order.priority).toBe("low");
        expect(dbServiceMock.updateOrderStatus).toHaveBeenCalledWith(order.id, "unknown_error", "low");
    });

    it("should set status to 'processed' when apiAmount is exactly 50 and order.amount is 99", async () => {
        const order = new Order(11, "B", 99, false, 123);
        apiClientMock.callAPI.mockResolvedValueOnce({ status: "success", data: { id: 11, type: "B", amount: 50, flag: false, status: "new", priority: "medium", userId: 123 } });
        priorityCalculatorMock.calculate.mockReturnValueOnce("medium");

        await handler.process(order);

        expect(order.status).toBe("processed");
        expect(order.priority).toBe("medium");
        expect(dbServiceMock.updateOrderStatus).toHaveBeenCalledWith(order.id, "processed", "medium");
    });

    it("should set status to 'error' when apiAmount is exactly 50 and order.amount is 100", async () => {
        const order = new Order(12, "B", 100, false, 123);
        apiClientMock.callAPI.mockResolvedValueOnce({ status: "success", data: { id: 12, type: "B", amount: 50, flag: false, status: "new", priority: "high", userId: 123 } });
        priorityCalculatorMock.calculate.mockReturnValueOnce("high");

        await handler.process(order);

        expect(order.status).toBe("error");
        expect(order.priority).toBe("high");
        expect(dbServiceMock.updateOrderStatus).toHaveBeenCalledWith(order.id, "error", "high");
    });

    it("should set status to 'pending' when apiAmount is 49 and order.flag is false", async () => {
        const order = new Order(13, "B", 80, false, 123);
        apiClientMock.callAPI.mockResolvedValueOnce({ status: "success", data: { id: 13, type: "B", amount: 49, flag: false, status: "new", priority: "low", userId: 123 } });
        priorityCalculatorMock.calculate.mockReturnValueOnce("low");

        await handler.process(order);

        expect(order.status).toBe("pending");
        expect(order.priority).toBe("low");
        expect(dbServiceMock.updateOrderStatus).toHaveBeenCalledWith(order.id, "pending", "low");
    });

    it("should set status to 'pending' when apiAmount is 49 and order.flag is true", async () => {
        const order = new Order(14, "B", 80, true, 123);
        apiClientMock.callAPI.mockResolvedValueOnce({ status: "success", data: { id: 14, type: "B", amount: 49, flag: true, status: "new", priority: "low", userId: 123 } });
        priorityCalculatorMock.calculate.mockReturnValueOnce("low");

        await handler.process(order);

        expect(order.status).toBe("pending");
        expect(order.priority).toBe("low");
        expect(dbServiceMock.updateOrderStatus).toHaveBeenCalledWith(order.id, "pending", "low");
    });

    it("should set status to 'error' when apiAmount is undefined and order.amount is 0", async () => {
        const order = new Order(15, "B", 0, false, 123);
        apiClientMock.callAPI.mockResolvedValueOnce({ status: "success", data: {} as Order });
        priorityCalculatorMock.calculate.mockReturnValueOnce("low");

        await handler.process(order);

        expect(order.status).toBe("error");
        expect(order.priority).toBe("low");
        expect(dbServiceMock.updateOrderStatus).toHaveBeenCalledWith(order.id, "error", "low");
    });

    it("should set status to 'error' when apiAmount is undefined and order.amount is greater than 0", async () => {
        const order = new Order(16, "B", 10, false, 123);
        apiClientMock.callAPI.mockResolvedValueOnce({ status: "success", data: {} as Order });
        priorityCalculatorMock.calculate.mockReturnValueOnce("low");

        await handler.process(order);

        expect(order.status).toBe("error");
        expect(order.priority).toBe("low");
        expect(dbServiceMock.updateOrderStatus).toHaveBeenCalledWith(order.id, "error", "low");
    });

    it("should set status to 'error' when apiStatus is not 'success'", async () => {
        const order = new Order(17, "B", 80, false, 123);
        apiClientMock.callAPI.mockResolvedValueOnce({ status: "failure", data: { id: 17, type: "B", amount: 60, flag: false, status: "new", priority: "medium", userId: 123 } });
        priorityCalculatorMock.calculate.mockReturnValueOnce("medium");

        await handler.process(order);

        expect(order.status).toBe("api_error");
        expect(order.priority).toBe("medium");
        expect(dbServiceMock.updateOrderStatus).toHaveBeenCalledWith(order.id, "api_error", "medium");
    });

});