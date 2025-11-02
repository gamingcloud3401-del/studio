export type Order = {
    id: string;
    productId: string;
    customerName: string;
    customerContact: string;
    customerAddress: string;
    orderDate: string;
    isCompleted: boolean;
    completedDate?: string; // Added to track when an order was completed
    productDetails?: {
        name: string;
        price: number;
        size: string;
    }
};
