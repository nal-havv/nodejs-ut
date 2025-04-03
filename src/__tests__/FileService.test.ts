import { FileService } from "../FileService";
import { Order } from "../Order";
import * as fs from "fs/promises";

jest.mock("fs/promises");

describe("FileService", () => {
    let fileService: FileService;

    beforeEach(() => {
        fileService = new FileService();
        jest.clearAllMocks();
    });

    it("should write a CSV file with correct filename format", async () => {
        const order: Order = {
            id: 123,
            userId: 1,
            type: "A",
            amount: 100,
            flag: true,
            status: "pending",
            priority: "low",
        };

        const spyWriteFile = jest.spyOn(fs, "writeFile").mockResolvedValue();

        await fileService.writeOrderToFile(order);

        expect(spyWriteFile).toHaveBeenCalledWith(
            expect.stringMatching(/^orders_type_A_1_\d+\.csv$/),
            expect.any(String)
        );
    });

    it("should write correct content for orders with amount <= 150", async () => {
        const order: Order = {
            id: 123,
            userId: 1,
            type: "A",
            amount: 100,
            flag: true,
            status: "pending",
            priority: "low",
        };

        const spyWriteFile = jest.spyOn(fs, "writeFile").mockResolvedValue();

        await fileService.writeOrderToFile(order);

        expect(spyWriteFile).toHaveBeenCalledWith(
            expect.any(String),
            `ID,Type,Amount,Flag,Status,Priority\n123,A,100,true,pending,low\n`
        );
    });

    it("should append 'High value order' note for orders with amount > 150", async () => {
        const order: Order = {
            id: 123,
            userId: 1,
            type: "A",
            amount: 200,
            flag: false,
            status: "completed",
            priority: "high",
        };

        const spyWriteFile = jest.spyOn(fs, "writeFile").mockResolvedValue();

        await fileService.writeOrderToFile(order);

        expect(spyWriteFile).toHaveBeenCalledWith(
            expect.any(String),
            `ID,Type,Amount,Flag,Status,Priority\n123,A,200,false,completed,high\n,,,,Note,High value order\n`
        );
    });

    it("should handle errors during file writing gracefully", async () => {
        const order: Order = {
            id: 123,
            userId: 1,
            type: "A",
            amount: 100,
            flag: true,
            status: "pending",
            priority: "low",
        };

        jest.spyOn(fs, "writeFile").mockRejectedValue(new Error("File write error"));

        await expect(fileService.writeOrderToFile(order)).rejects.toThrow("File write error");
    });

    it("should test edge cases for order.amount (e.g., exactly 150)", async () => {
        const order: Order = {
            id: 123,
            userId: 1,
            type: "A",
            amount: 150,
            flag: true,
            status: "pending",
            priority: "low",
        };

        const spyWriteFile = jest.spyOn(fs, "writeFile").mockResolvedValue();

        await fileService.writeOrderToFile(order);

        expect(spyWriteFile).toHaveBeenCalledWith(
            expect.any(String),
            `ID,Type,Amount,Flag,Status,Priority\n123,A,150,true,pending,low\n`
        );
    });

    it("should call fs.writeFile with correct arguments", async () => {
        const order: Order = {
            id: 123,
            userId: 1,
            type: "A",
            amount: 100,
            flag: true,
            status: "pending",
            priority: "low",
        };

        const spyWriteFile = jest.spyOn(fs, "writeFile").mockResolvedValue();

        await fileService.writeOrderToFile(order);

        expect(spyWriteFile).toHaveBeenCalledWith(
            expect.any(String),
            expect.stringContaining("ID,Type,Amount,Flag,Status,Priority")
        );
    });
});
