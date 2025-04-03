export class Order {
    id: number;
    type: string;
    amount: number;
    flag: boolean;
    status: string;
    priority: string;
    userId: number;

    constructor(id: number, type: string, amount: number, flag: boolean, userId: number) {
        this.id = id;
        this.type = type;
        this.amount = amount;
        this.flag = flag;
        this.status = 'new';
        this.priority = 'low';
        this.userId = userId;
    }
}
