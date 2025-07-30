export const formatCurrency = (amount: number, currency: string = '₹'): string => {
  return `${currency}${amount.toFixed(2)}`;
};

export const formatDistance = (distanceInKm: number): string => {
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)}m`;
  }
  return `${distanceInKm.toFixed(1)}km`;
};

export const formatTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}min`;
};

export const formatDate = (date: string | Date, format: 'short' | 'long' | 'time' = 'short'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    case 'long':
      return dateObj.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    case 'time':
      return dateObj.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    default:
      return dateObj.toLocaleString('en-IN');
  }
};

export const formatOrderStatus = (status: string): string => {
  switch (status) {
    case 'assigned':
      return 'New Order';
    case 'accepted':
      return 'Accepted';
    case 'picked':
      return 'Picked Up';
    case 'en_route':
      return 'On the Way';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

export const getOrderStatusColor = (status: string): string => {
  switch (status) {
    case 'assigned':
      return '#EA580C';
    case 'accepted':
      return '#3B82F6';
    case 'picked':
      return '#8B5CF6';
    case 'en_route':
      return '#F59E0B';
    case 'delivered':
      return '#10B981';
    case 'cancelled':
      return '#EF4444';
    default:
      return '#6B7280';
  }
};

export const formatPhoneNumber = (phone: string): string => {
  // Format Indian phone numbers
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};

export const calculateEarnings = (orders: any[]): { today: number; week: number; month: number } => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return orders.reduce(
    (acc, order) => {
      const orderDate = new Date(order.createdAt);
      const earning = order.deliveryFee || 0;

      if (orderDate >= today) acc.today += earning;
      if (orderDate >= weekStart) acc.week += earning;
      if (orderDate >= monthStart) acc.month += earning;

      return acc;
    },
    { today: 0, week: 0, month: 0 }
  );
};