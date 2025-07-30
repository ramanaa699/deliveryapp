import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { StackScreenProps } from '@react-navigation/stack';
import { OrdersStackParamList } from '../../navigation/OrdersNavigator';
import { RootState, AppDispatch } from '../../store';
import { Card } from '../../components/Card';
import { ListItem } from '../../components/ListItem';
import { lightTheme } from '../../theme';
import { fetchActiveOrders, fetchOrderHistory } from '../../store/slices/ordersSlice';
import { formatCurrency, formatDate, formatOrderStatus, getOrderStatusColor } from '../../utils/formatters';
import { Package, Filter, Calendar, MapPin } from 'lucide-react-native';

type Props = StackScreenProps<OrdersStackParamList, 'OrdersList'>;

const OrdersListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = lightTheme;
  
  const { activeOrders, orderHistory, isLoading } = useSelector((state: RootState) => state.orders);
  
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  const loadOrders = async () => {
    try {
      if (activeTab === 'active') {
        await dispatch(fetchActiveOrders());
      } else {
        await dispatch(fetchOrderHistory());
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const orders = activeTab === 'active' ? activeOrders : orderHistory;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          Orders
        </Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter color={theme.colors.onSurfaceVariant} size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'active' && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => setActiveTab('active')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'active' ? '#FFFFFF' : theme.colors.onSurface },
            ]}
          >
            Active ({activeOrders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'history' && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => setActiveTab('history')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'history' ? '#FFFFFF' : theme.colors.onSurface },
            ]}
          >
            History
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {orders.length === 0 ? (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyState}>
              <Package color={theme.colors.onSurfaceVariant} size={48} />
              <Text style={[styles.emptyStateText, { color: theme.colors.onSurfaceVariant }]}>
                No {activeTab} orders
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: theme.colors.onSurfaceVariant }]}>
                {activeTab === 'active' 
                  ? 'New orders will appear here when assigned'
                  : 'Your completed orders will appear here'
                }
              </Text>
            </View>
          </Card>
        ) : (
          <View style={styles.ordersList}>
            {orders.map((order) => (
              <Card key={order.id} style={styles.orderCard}>
                <ListItem
                  title={`Order #${order.orderNumber}`}
                  subtitle={`${order.restaurantName} • ${formatCurrency(order.totalAmount)}`}
                  leftIcon={
                    <View style={[styles.statusBadge, { backgroundColor: getOrderStatusColor(order.status) }]}>
                      <Text style={styles.statusText}>
                        {formatOrderStatus(order.status)}
                      </Text>
                    </View>
                  }
                  rightIcon={<MapPin color={theme.colors.onSurfaceVariant} size={20} />}
                  onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })}
                />
                <View style={styles.orderMeta}>
                  <View style={styles.metaItem}>
                    <Calendar color={theme.colors.onSurfaceVariant} size={16} />
                    <Text style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
                      {formatDate(order.createdAt, 'time')}
                    </Text>
                  </View>
                  <Text style={[styles.distanceText, { color: theme.colors.onSurfaceVariant }]}>
                    {order.distance.toFixed(1)} km
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
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
  title: {
    fontSize: lightTheme.typography.h2.fontSize,
    fontWeight: lightTheme.typography.h2.fontWeight,
  },
  filterButton: {
    padding: lightTheme.spacing.sm,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: lightTheme.colors.surfaceVariant,
    borderRadius: lightTheme.borderRadius.md,
    padding: lightTheme.spacing.xs,
    marginHorizontal: lightTheme.spacing.lg,
    marginBottom: lightTheme.spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: lightTheme.spacing.md,
    borderRadius: lightTheme.borderRadius.sm,
    alignItems: 'center',
  },
  tabText: {
    fontSize: lightTheme.typography.button.fontSize,
    fontWeight: lightTheme.typography.button.fontWeight,
  },
  content: {
    flex: 1,
    paddingHorizontal: lightTheme.spacing.lg,
  },
  emptyCard: {
    marginTop: lightTheme.spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: lightTheme.spacing.xxl,
  },
  emptyStateText: {
    fontSize: lightTheme.typography.body.fontSize,
    fontWeight: '500',
    marginTop: lightTheme.spacing.md,
  },
  emptyStateSubtext: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    marginTop: lightTheme.spacing.xs,
    textAlign: 'center',
  },
  ordersList: {
    gap: lightTheme.spacing.md,
  },
  orderCard: {
    padding: 0,
  },
  statusBadge: {
    paddingHorizontal: lightTheme.spacing.sm,
    paddingVertical: lightTheme.spacing.xs,
    borderRadius: lightTheme.borderRadius.full,
    minWidth: 80,
    alignItems: 'center',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: lightTheme.typography.caption.fontSize,
    fontWeight: '600',
  },
  orderMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: lightTheme.spacing.md,
    paddingBottom: lightTheme.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lightTheme.spacing.xs,
  },
  metaText: {
    fontSize: lightTheme.typography.caption.fontSize,
  },
  distanceText: {
    fontSize: lightTheme.typography.caption.fontSize,
    fontWeight: '500',
  },
});

export default OrdersListScreen;