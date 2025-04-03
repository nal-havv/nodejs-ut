import { PriorityCalculator } from "../PriorityCalculator";

describe("PriorityCalculator", () => {
    let calculator: PriorityCalculator;

    beforeEach(() => {
        calculator = new PriorityCalculator();
    });

    it("should return 'high' when amount > 200", () => {
        const result = calculator.calculate(250);
        expect(result).toBe("high");
    });

    it("should return 'low' when amount <= 200", () => {
        const result = calculator.calculate(150);
        expect(result).toBe("low");
    });

    it("should return 'low' when amount is exactly 200", () => {
        const result = calculator.calculate(200);
        expect(result).toBe("low");
    });

    it("should return 'low' when amount is a negative number", () => {
        const result = calculator.calculate(-50);
        expect(result).toBe("low");
    });

    it("should return 'high' when amount is a very large number", () => {
        const result = calculator.calculate(1000);
        expect(result).toBe("high");
    });
});
