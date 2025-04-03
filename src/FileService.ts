import * as fs from "fs/promises";
import { Order } from "./Order";

export class FileService {
    async writeOrderToFile(order: Order): Promise<void> {
        const csvFile = `orders_type_A_${order.userId}_${Date.now()}.csv`;
        let content = `ID,Type,Amount,Flag,Status,Priority\n${order.id},${order.type},${order.amount},${order.flag ? 'true' : 'false'},${order.status},${order.priority}\n`;

        if (order.amount > 150) {
            content += ',,,,Note,High value order\n';
        }

        await fs.writeFile(csvFile, content);
    }
}
