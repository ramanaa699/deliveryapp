import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl, TouchableOpacity, Switch } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { StackScreenProps } from '@react-navigation/stack';
import { DashboardStackParamList } from '../../navigation/DashboardNavigator';
import { RootState, AppDispatch } from '../../store';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ListItem } from '../../components/ListItem';
import { lightTheme } from '../../theme';
import { fetchActiveOrders } from '../../store/slices/ordersSlice';
import { fetchWalletData } from '../../store/slices/earningsSlice';
import { setOnlineStatus } from '../../store/slices/appSlice';
import { formatCurrency, formatOrderStatus, getOrderStatusColor, calculateEarnings } from '../../utils/formatters';
import { Package, Wallet, Clock, TrendingUp, MapPin, Star } from 'lucide-react-native';

type Props = StackScreenProps<DashboardStackParamList, 'Dashboard'>;

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = lightTheme;
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { activeOrders, orderHistory } = useSelector((state: RootState) => state.orders);
  const { wallet } = useSelector((state: RootState) => state.earnings);
  const { isOnline } = useSelector((state: RootState) => state.app);
  
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        dispatch(fetchActiveOrders()),
        dispatch(fetchWalletData()),
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleToggleOnlineStatus = (value: boolean) => {
    dispatch(setOnlineStatus(value));
    // TODO: integrate backend call here to update online status
  };

  const earnings = calculateEarnings(orderHistory);
  const pendingOrders = activeOrders.filter(order => order.status === 'assigned').length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.colors.onSurfaceVariant }]}>
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}
            </Text>
            <Text style={[styles.userName, { color: theme.colors.onBackground }]}>
              {user?.name || 'Delivery Partner'}
            </Text>
          </View>
          <View style={styles.onlineToggle}>
            <Text style={[styles.onlineLabel, { color: isOnline ? theme.colors.success : theme.colors.onSurfaceVariant }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
            <Switch
              value={isOnline}
              onValueChange={handleToggleOnlineStatus}
              trackColor={{ false: theme.colors.border, true: theme.colors.success }}
              thumbColor={isOnline ? '#FFFFFF' : theme.colors.onSurfaceVariant}
            />
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Wallet color={theme.colors.primary} size={24} />
              <View style={styles.statInfo}>
                <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
                  {formatCurrency(wallet.balance)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Wallet Balance
                </Text>
              </View>
            </View>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Package color={theme.colors.accent} size={24} />
              <View style={styles.statInfo}>
                <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
                  {pendingOrders}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  New Orders
                </Text>
              </View>
            </View>
          </Card>
        </View>

        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <TrendingUp color={theme.colors.success} size={24} />
              <View style={styles.statInfo}>
                <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
                  {formatCurrency(earnings.today)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Today's Earnings
                </Text>
              </View>
            </View>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Star color={theme.colors.warning} size={24} />
              <View style={styles.statInfo}>
                <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
                  {user?.rating.toFixed(1) || '0.0'}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Rating
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Active Orders */}
        <Card style={styles.ordersCard}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
              Active Orders
            </Text>
            {activeOrders.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('OrderDetails', { orderId: activeOrders[0].id })}>
                <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>
                  View All
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {activeOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <Package color={theme.colors.onSurfaceVariant} size={48} />
              <Text style={[styles.emptyStateText, { color: theme.colors.onSurfaceVariant }]}>
                No active orders
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: theme.colors.onSurfaceVariant }]}>
                {isOnline ? 'New orders will appear here' : 'Go online to receive orders'}
              </Text>
            </View>
          ) : (
            <View style={styles.ordersList}>
              {activeOrders.slice(0, 3).map((order) => (
                <ListItem
                  key={order.id}
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
              ))}
            </View>
          )}
        </Card>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
            Quick Actions
          </Text>
          <View style={styles.actionButtons}>
            <Button
              title="View Orders"
              onPress={() => navigation.navigate('OrdersList' as any)}
              variant="outline"
              style={styles.actionButton}
            />
            <Button
              title="Earnings"
              onPress={() => navigation.navigate('Earnings' as any)}
              variant="outline"
              style={styles.actionButton}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: lightTheme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: lightTheme.spacing.lg,
  },
  greeting: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
  },
  userName: {
    fontSize: lightTheme.typography.h3.fontSize,
    fontWeight: lightTheme.typography.h3.fontWeight,
    marginTop: lightTheme.spacing.xs,
  },
  onlineToggle: {
    alignItems: 'center',
    gap: lightTheme.spacing.sm,
  },
  onlineLabel: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: lightTheme.spacing.md,
    marginBottom: lightTheme.spacing.md,
  },
  statCard: {
    flex: 1,
    padding: lightTheme.spacing.md,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lightTheme.spacing.md,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: lightTheme.typography.h4.fontWeight,
  },
  statLabel: {
    fontSize: lightTheme.typography.caption.fontSize,
    marginTop: lightTheme.spacing.xs,
  },
  ordersCard: {
    marginBottom: lightTheme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: lightTheme.spacing.md,
  },
  cardTitle: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: lightTheme.typography.h4.fontWeight,
  },
  viewAllText: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    fontWeight: '500',
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
    gap: lightTheme.spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: lightTheme.spacing.sm,
    paddingVertical: lightTheme.spacing.xs,
    borderRadius: lightTheme.borderRadius.full,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: lightTheme.typography.caption.fontSize,
    fontWeight: '600',
  },
  actionsCard: {
    marginBottom: lightTheme.spacing.lg,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: lightTheme.spacing.md,
    marginTop: lightTheme.spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});

export default DashboardScreen;