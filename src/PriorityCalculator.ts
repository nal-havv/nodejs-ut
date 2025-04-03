export class PriorityCalculator {
    calculate(amount: number): string {
        return amount > 200 ? 'high' : 'low';
    }
}
