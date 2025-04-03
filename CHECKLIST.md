# Test Cases Checklist

## PriorityCalculator
- [x] Should return "high" when amount > 200.
- [x] Should return "low" when amount <= 200.
- [x] Should return "low" when amount is exactly 200.
- [x] Should return "low" when amount is a negative number.
- [x] Should return "high" when amount is a very large number.

## FileService
- [x] Should write a CSV file with correct filename format.
- [x] Should write correct content for orders with `amount <= 150`.
- [x] Should append "High value order" note for orders with `amount > 150`.
- [x] Should handle errors during file writing gracefully.
- [x] Should test edge cases for `order.amount` (e.g., exactly 150).
- [x] should call fs.writeFile with correct arguments

## OrderTypeAHandler
- [x] Should set status to "exported" when file writing succeeds.
- [x] Should set status to "export_failed" when file writing fails.
- [x] Should calculate priority using PriorityCalculator.
- [x] Should call updateOrderStatus with correct parameters.
- [x] Should handle exceptions thrown by DatabaseService gracefully.
- [x] Should write the order to a file using `FileService`.
- [x] Should set the order status to 'exported' if file writing succeeds.
- [x] Should set the order status to 'export_failed' if file writing fails.
- [x] Should calculate the order priority using `PriorityCalculator`.
- [x] Should update the order status and priority in the database using `DatabaseService`.
- [x] Should handle exceptions gracefully during file writing.
- [x] Should ensure all dependencies (`DatabaseService`, `FileService`, `PriorityCalculator`) are called with correct arguments.

## OrderTypeBHandler
- [x] Should set status to 'processed' when API response is successful and conditions are met.
- [x] Should set status to 'pending' when API response is successful but conditions are not met.
- [x] Should set status to 'error' when API response is successful but no conditions are met.
- [x] Should set status to 'api_error' when API response fails.
- [x] Should set status to 'api_failure' when APIException is thrown.
- [x] Should set status to 'processed' when apiAmount is exactly 50 and order.amount is less than 100.
- [x] Should set status to 'pending' when apiAmount is exactly 50 but order.flag is true.
- [x] Should set status to 'pending' when apiAmount is less than 50.
- [x] Should set status to 'unknown_error' when an unknown error is thrown.
- [x] Should set status to 'processed' when apiAmount is exactly 50 and order.amount is 99.
- [x] Should set status to 'error' when apiAmount is exactly 50 and order.amount is 100.
- [x] Should set status to 'pending' when apiAmount is 49 and order.flag is false.
- [x] Should set status to 'pending' when apiAmount is 49 and order.flag is true.
- [x] Should set status to 'error' when apiAmount is undefined and order.amount is 0.

## OrderTypeCHandler
- [x] Should set status to "completed" when flag is true.
- [x] Should set status to "in_progress" when flag is false.
- [x] Should calculate priority using PriorityCalculator.
- [x] Should call updateOrderStatus with correct parameters.
- [x] Should not modify the order object before calling updateOrderStatus.
- [x] Should handle errors thrown by DatabaseService gracefully.
- [x] Should handle errors thrown by PriorityCalculator gracefully.

## OrderHandlerFactory
- [x] Should return OrderTypeAHandler for type "A".
- [x] Should return OrderTypeBHandler for type "B".
- [x] Should return OrderTypeCHandler for type "C".
- [x] Should throw an error for unknown order types.
- [x] Should return the correct DatabaseService instance.

## OrderProcessingService
- [x] Should process all orders for a user.
- [x] Should return false if an error occurs during processing.
- [x] Should call the correct handler based on order type.
- [x] Should update the database with the correct status and priority.
- [x] Should handle an empty list of orders gracefully.
- [x] Should handle a mix of order types correctly.
- [x] Should not process orders if the database service fails.
- [x] Should handle exceptions thrown by handlers gracefully.
- [x] Should skip processing for invalid order types.