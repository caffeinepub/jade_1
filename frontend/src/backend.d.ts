import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface OrderT {
    id: bigint;
    status: OrderStatus;
    total: number;
    timestamp: Time;
    items: Array<OrderItem>;
}
export type Time = bigint;
export interface Product {
    id: bigint;
    name: string;
    imageUrl: string;
    category: Category;
    price: number;
}
export interface OrderItem {
    quantity: bigint;
    product: Product;
}
export enum Category {
    accessories = "accessories",
    dresses = "dresses",
    mens = "mens",
    tops = "tops",
    bottoms = "bottoms",
    shoes = "shoes",
    womens = "womens"
}
export enum OrderStatus {
    shipped = "shipped",
    delivered = "delivered",
    confirmed = "confirmed",
    processing = "processing"
}
export interface backendInterface {
    addProduct(name: string, price: number, imageUrl: string, category: Category): Promise<void>;
    getCategoryByString(categoryStr: string): Promise<Category>;
    getOrder(orderId: bigint): Promise<OrderT>;
    getProductsByCategory(category: Category): Promise<Array<Product>>;
    initializeProducts(): Promise<void>;
    placeOrder(items: Array<OrderItem>): Promise<bigint>;
    searchProducts(searchTerm: string): Promise<Array<Product>>;
    updateOrderStatus(orderId: bigint, status: OrderStatus): Promise<void>;
}
