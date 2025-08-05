import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import DatabaseService from '../services/DatabaseService';
import {Motor, Odometer} from '../types';
import {RootStackParamList} from '../navigation/AppNavigator';

type DashboardScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Main'
>;

interface DashboardData {
  motor: Motor | null;
  odometer: Odometer | null;
  upcomingReminders: any[];
  overdueReminders: any[];
}

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const [data, setData] = useState<DashboardData>({
    motor: null,
    odometer: null,
    upcomingReminders: [],
    overdueReminders: [],
  });
  const [loading, setLoading] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get first motor (assuming single motor for now)
      const motors = await DatabaseService.getMotors();
      if (motors.length === 0) {
        navigation.replace('AddMotor');
        return;
      }

      const motor = motors[0];
      const odometer = await DatabaseService.getOdometerByMotorId(motor.motor_id!);
      const allReminders = await DatabaseService.getUpcomingReminders(motor.motor_id);
      
      // Separate overdue and upcoming reminders
      const today = new Date();
      const overdueReminders = allReminders.filter(r => {
        const reminderDate = new Date(r.tanggal_reminder || '');
        return reminderDate < today;
      });
      
      const upcomingReminders = allReminders.filter(r => {
        const reminderDate = new Date(r.tanggal_reminder || '');
        return reminderDate >= today;
      });

      setData({
        motor,
        odometer,
        upcomingReminders: upcomingReminders.slice(0, 3), // Show top 3
        overdueReminders,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const handleUpdateOdometer = () => {
    if (data.motor) {
      navigation.navigate('UpdateOdometer', {motorId: data.motor.motor_id!});
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getMaintenanceStatusColor = (count: number) => {
    if (count === 0) return '#4CAF50'; // Green
    if (count <= 2) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getMaintenanceStatusText = () => {
    const overdueCount = data.overdueReminders.length;
    const upcomingCount = data.upcomingReminders.length;
    
    if (overdueCount > 0) {
      return `${overdueCount} perawatan tertunda`;
    }
    if (upcomingCount > 0) {
      return `${upcomingCount} perawatan akan datang`;
    }
    return 'Semua perawatan up to date';
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadDashboardData} />
      }>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>
          {data.motor ? data.motor.nama_motor : 'Loading...'}
        </Text>
      </View>

      {/* Motor Info Card */}
      {data.motor && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🏍️ Informasi Motor</Text>
          </View>
          <View style={styles.motorInfo}>
            <View style={styles.motorDetail}>
              <Text style={styles.motorLabel}>Nama Motor</Text>
              <Text style={styles.motorValue}>{data.motor.nama_motor}</Text>
            </View>
            {data.motor.tahun_motor && (
              <View style={styles.motorDetail}>
                <Text style={styles.motorLabel}>Tahun</Text>
                <Text style={styles.motorValue}>{data.motor.tahun_motor}</Text>
              </View>
            )}
            <View style={styles.motorDetail}>
              <Text style={styles.motorLabel}>Kilometer Terakhir</Text>
              <Text style={styles.motorValue}>
                {data.odometer?.km_terakhir?.toLocaleString() || 'Belum diinput'} km
              </Text>
            </View>
            {data.odometer?.tanggal_update && (
              <View style={styles.motorDetail}>
                <Text style={styles.motorLabel}>Update Terakhir</Text>
                <Text style={styles.motorValue}>
                  {formatDate(data.odometer.tanggal_update)}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity 
            style={styles.updateButton}
            onPress={handleUpdateOdometer}>
            <Text style={styles.updateButtonText}>Update Odometer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Maintenance Status Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>🔧 Status Perawatan</Text>
        </View>
        <View 
          style={[
            styles.statusIndicator,
            {backgroundColor: getMaintenanceStatusColor(data.overdueReminders.length)}
          ]}>
          <Text style={styles.statusText}>
            {getMaintenanceStatusText()}
          </Text>
        </View>
      </View>

      {/* Overdue Reminders */}
      {data.overdueReminders.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>⚠️ Perawatan Tertunda</Text>
          </View>
          {data.overdueReminders.map((reminder, index) => (
            <View key={index} style={styles.reminderItem}>
              <View style={styles.reminderContent}>
                <Text style={styles.reminderTitle}>
                  {reminder.jenis_perawatan}
                </Text>
                <Text style={styles.reminderDate}>
                  Seharusnya: {formatDate(reminder.tanggal_reminder)}
                </Text>
              </View>
              <View style={[styles.reminderStatus, styles.overdueStatus]}>
                <Text style={styles.reminderStatusText}>Tertunda</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Upcoming Reminders */}
      {data.upcomingReminders.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>📅 Perawatan Mendatang</Text>
          </View>
          {data.upcomingReminders.map((reminder, index) => (
            <View key={index} style={styles.reminderItem}>
              <View style={styles.reminderContent}>
                <Text style={styles.reminderTitle}>
                  {reminder.jenis_perawatan}
                </Text>
                <Text style={styles.reminderDate}>
                  Jadwal: {formatDate(reminder.tanggal_reminder)}
                </Text>
              </View>
              <View style={[styles.reminderStatus, styles.upcomingStatus]}>
                <Text style={styles.reminderStatusText}>Akan Datang</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>⚡ Aksi Cepat</Text>
        </View>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={handleUpdateOdometer}>
            <Text style={styles.quickActionIcon}>🏃‍♂️</Text>
            <Text style={styles.quickActionText}>Update{'\n'}Odometer</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Main', {screen: 'Maintenance'})}>
            <Text style={styles.quickActionIcon}>🔧</Text>
            <Text style={styles.quickActionText}>Kelola{'\n'}Perawatan</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Main', {screen: 'History'})}>
            <Text style={styles.quickActionIcon}>📋</Text>
            <Text style={styles.quickActionText}>Lihat{'\n'}Riwayat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E3F2FD',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  motorInfo: {
    marginBottom: 16,
  },
  motorDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  motorLabel: {
    fontSize: 16,
    color: '#666',
  },
  motorValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  updateButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusIndicator: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  reminderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reminderDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  reminderStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  overdueStatus: {
    backgroundColor: '#F44336',
  },
  upcomingStatus: {
    backgroundColor: '#FF9800',
  },
  reminderStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    minWidth: 80,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
});

export default DashboardScreen;