export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  vehicleType: 'bike' | 'scooter' | 'car';
  isOnline: boolean;
  rating: number;
  totalDeliveries: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  restaurantName: string;
  restaurantAddress: string;
  deliveryAddress: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryFee: number;
  distance: number;
  estimatedTime: number;
  pickupLocation: Location;
  dropLocation: Location;
  createdAt: string;
  acceptedAt?: string;
  pickedAt?: string;
  deliveredAt?: string;
  specialInstructions?: string;
  paymentMethod: 'cash' | 'card' | 'upi';
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  customizations?: string[];
}

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export enum OrderStatus {
  ASSIGNED = 'assigned',
  ACCEPTED = 'accepted',
  PICKED = 'picked',
  EN_ROUTE = 'en_route',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export interface Earnings {
  id: string;
  orderId: string;
  amount: number;
  type: 'delivery_fee' | 'tip' | 'bonus' | 'penalty';
  date: string;
  paymentMethod: 'cash' | 'digital';
  status: 'pending' | 'paid';
}

export interface Wallet {
  balance: number;
  pendingAmount: number;
  totalEarnings: number;
  cashInHand: number;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: 'order_issue' | 'payment' | 'technical' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  images?: string[];
  createdAt: string;
  updatedAt: string;
  responses?: TicketResponse[];
}

export interface TicketResponse {
  id: string;
  message: string;
  isAdmin: boolean;
  timestamp: string;
}

export interface Rating {
  id: string;
  orderId: string;
  rating: number;
  feedback?: string;
  type: 'customer' | 'restaurant';
  createdAt: string;
}

export interface AppState {
  auth: AuthState;
  orders: {
    activeOrders: Order[];
    orderHistory: Order[];
    currentOrder: Order | null;
    isLoading: boolean;
  };
  earnings: {
    wallet: Wallet;
    transactions: Earnings[];
    isLoading: boolean;
  };
  tickets: {
    tickets: Ticket[];
    isLoading: boolean;
  };
  app: {
    theme: 'light' | 'dark';
    language: 'en' | 'hi' | 'te';
    isOnline: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}