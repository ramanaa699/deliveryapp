import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { StackScreenProps } from '@react-navigation/stack';
import { OrdersStackParamList } from '../../navigation/OrdersNavigator';
import { RootState, AppDispatch } from '../../store';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ListItem } from '../../components/ListItem';
import { lightTheme } from '../../theme';
import { acceptOrder, rejectOrder, updateOrderStatus } from '../../store/slices/ordersSlice';
import { formatCurrency, formatDate, formatOrderStatus, getOrderStatusColor, formatPhoneNumber } from '../../utils/formatters';
import { ArrowLeft, Phone, MapPin, Clock, Package, User, Navigation } from 'lucide-react-native';

type Props = StackScreenProps<OrdersStackParamList, 'OrderDetails'>;

const OrderDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = lightTheme;
  const { orderId } = route.params;
  
  const { activeOrders, orderHistory } = useSelector((state: RootState) => state.orders);
  const [loading, setLoading] = useState(false);

  const order = [...activeOrders, ...orderHistory].find(o => o.id === orderId);

  if (!order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            Order not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleAcceptOrder = async () => {
    setLoading(true);
    try {
      await dispatch(acceptOrder(orderId)).unwrap();
      Alert.alert('Success', 'Order accepted successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to accept order');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectOrder = () => {
    Alert.alert(
      'Reject Order',
      'Are you sure you want to reject this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await dispatch(rejectOrder({ orderId, reason: 'Driver rejected' })).unwrap();
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to reject order');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleUpdateStatus = async (status: string) => {
    setLoading(true);
    try {
      // TODO: integrate backend call here - get current location
      const location = { latitude: 0, longitude: 0 }; // Mock location
      await dispatch(updateOrderStatus({ orderId, status: status as any, location })).unwrap();
      Alert.alert('Success', `Order status updated to ${formatOrderStatus(status)}`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const handleCallCustomer = () => {
    Linking.openURL(`tel:${order.customerPhone}`);
  };

  const handleNavigate = (location: 'pickup' | 'drop') => {
    const coords = location === 'pickup' ? order.pickupLocation : order.dropLocation;
    const url = `https://maps.google.com/?q=${coords.latitude},${coords.longitude}`;
    Linking.openURL(url);
  };

  const getNextAction = () => {
    switch (order.status) {
      case 'assigned':
        return { label: 'Accept Order', action: handleAcceptOrder, variant: 'primary' as const };
      case 'accepted':
        return { label: 'Mark as Picked', action: () => handleUpdateStatus('picked'), variant: 'primary' as const };
      case 'picked':
        return { label: 'Start Delivery', action: () => handleUpdateStatus('en_route'), variant: 'primary' as const };
      case 'en_route':
        return { label: 'Mark as Delivered', action: () => handleUpdateStatus('delivered'), variant: 'primary' as const };
      default:
        return null;
    }
  };

  const nextAction = getNextAction();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={theme.colors.onBackground} size={24} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          Order Details
        </Text>
        <TouchableOpacity onPress={handleCallCustomer} style={styles.callButton}>
          <Phone color={theme.colors.primary} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Order Status */}
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusBadge, { backgroundColor: getOrderStatusColor(order.status) }]}>
              <Text style={styles.statusText}>
                {formatOrderStatus(order.status)}
              </Text>
            </View>
            <Text style={[styles.orderNumber, { color: theme.colors.onSurface }]}>
              #{order.orderNumber}
            </Text>
          </View>
          <Text style={[styles.orderTime, { color: theme.colors.onSurfaceVariant }]}>
            Ordered at {formatDate(order.createdAt, 'time')}
          </Text>
        </Card>

        {/* Customer Info */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Customer Details
          </Text>
          <ListItem
            title={order.customerName}
            subtitle={formatPhoneNumber(order.customerPhone)}
            leftIcon={<User color={theme.colors.primary} size={24} />}
            rightIcon={<Phone color={theme.colors.onSurfaceVariant} size={20} />}
            onPress={handleCallCustomer}
          />
        </Card>

        {/* Pickup Location */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Pickup Location
          </Text>
          <ListItem
            title={order.restaurantName}
            subtitle={order.restaurantAddress}
            leftIcon={<Package color={theme.colors.accent} size={24} />}
            rightIcon={<Navigation color={theme.colors.onSurfaceVariant} size={20} />}
            onPress={() => handleNavigate('pickup')}
          />
        </Card>

        {/* Drop Location */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Delivery Location
          </Text>
          <ListItem
            title="Delivery Address"
            subtitle={order.deliveryAddress}
            leftIcon={<MapPin color={theme.colors.success} size={24} />}
            rightIcon={<Navigation color={theme.colors.onSurfaceVariant} size={20} />}
            onPress={() => handleNavigate('drop')}
          />
        </Card>

        {/* Order Items */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Order Items
          </Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: theme.colors.onSurface }]}>
                  {item.quantity}x {item.name}
                </Text>
                {item.customizations && item.customizations.length > 0 && (
                  <Text style={[styles.itemCustomizations, { color: theme.colors.onSurfaceVariant }]}>
                    {item.customizations.join(', ')}
                  </Text>
                )}
              </View>
              <Text style={[styles.itemPrice, { color: theme.colors.onSurface }]}>
                {formatCurrency(item.price * item.quantity)}
              </Text>
            </View>
          ))}
        </Card>

        {/* Payment Summary */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Payment Summary
          </Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>
              Subtotal
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.onSurface }]}>
              {formatCurrency(order.totalAmount - order.deliveryFee)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>
              Delivery Fee
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.onSurface }]}>
              {formatCurrency(order.deliveryFee)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: theme.colors.onSurface }]}>
              Total Amount
            </Text>
            <Text style={[styles.totalValue, { color: theme.colors.primary }]}>
              {formatCurrency(order.totalAmount)}
            </Text>
          </View>
          <View style={styles.paymentMethod}>
            <Text style={[styles.paymentLabel, { color: theme.colors.onSurfaceVariant }]}>
              Payment Method: {order.paymentMethod.toUpperCase()}
            </Text>
          </View>
        </Card>

        {/* Special Instructions */}
        {order.specialInstructions && (
          <Card>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Special Instructions
            </Text>
            <Text style={[styles.instructions, { color: theme.colors.onSurfaceVariant }]}>
              {order.specialInstructions}
            </Text>
          </Card>
        )}
      </ScrollView>

      {/* Action Buttons */}
      {nextAction && (
        <View style={styles.actionContainer}>
          {order.status === 'assigned' && (
            <Button
              title="Reject"
              onPress={handleRejectOrder}
              variant="outline"
              style={styles.rejectButton}
              loading={loading}
            />
          )}
          <Button
            title={nextAction.label}
            onPress={nextAction.action}
            variant={nextAction.variant}
            style={styles.actionButton}
            loading={loading}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: lightTheme.spacing.lg,
    paddingVertical: lightTheme.spacing.md,
  },
  backButton: {
    padding: lightTheme.spacing.sm,
  },
  title: {
    fontSize: lightTheme.typography.h3.fontSize,
    fontWeight: lightTheme.typography.h3.fontWeight,
  },
  callButton: {
    padding: lightTheme.spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: lightTheme.spacing.lg,
  },
  statusCard: {
    marginBottom: lightTheme.spacing.md,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: lightTheme.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: lightTheme.spacing.md,
    paddingVertical: lightTheme.spacing.sm,
    borderRadius: lightTheme.borderRadius.full,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: lightTheme.typography.bodySmall.fontSize,
    fontWeight: '600',
  },
  orderNumber: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: lightTheme.typography.h4.fontWeight,
  },
  orderTime: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
  },
  sectionTitle: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: lightTheme.typography.h4.fontWeight,
    marginBottom: lightTheme.spacing.md,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: lightTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.colors.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: lightTheme.typography.body.fontSize,
    fontWeight: '500',
  },
  itemCustomizations: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    marginTop: lightTheme.spacing.xs,
  },
  itemPrice: {
    fontSize: lightTheme.typography.body.fontSize,
    fontWeight: '500',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: lightTheme.spacing.sm,
  },
  summaryLabel: {
    fontSize: lightTheme.typography.body.fontSize,
  },
  summaryValue: {
    fontSize: lightTheme.typography.body.fontSize,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: lightTheme.colors.border,
    marginTop: lightTheme.spacing.sm,
    paddingTop: lightTheme.spacing.md,
  },
  totalLabel: {
    fontSize: lightTheme.typography.body.fontSize,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: lightTheme.typography.h4.fontWeight,
  },
  paymentMethod: {
    marginTop: lightTheme.spacing.sm,
  },
  paymentLabel: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    fontWeight: '500',
  },
  instructions: {
    fontSize: lightTheme.typography.body.fontSize,
    lineHeight: 24,
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: lightTheme.spacing.lg,
    paddingVertical: lightTheme.spacing.md,
    gap: lightTheme.spacing.md,
  },
  rejectButton: {
    flex: 1,
  },
  actionButton: {
    flex: 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: lightTheme.typography.body.fontSize,
  },
});

export default OrderDetailsScreen;