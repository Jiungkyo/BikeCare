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
import {Perawatan, Motor} from '../types';
import {RootStackParamList} from '../navigation/AppNavigator';

type MaintenanceScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Main'
>;

interface MaintenanceData {
  motor: Motor | null;
  perawatan: Perawatan[];
  reminders: any[];
}

const MaintenanceScreen: React.FC = () => {
  const navigation = useNavigation<MaintenanceScreenNavigationProp>();
  const [data, setData] = useState<MaintenanceData>({
    motor: null,
    perawatan: [],
    reminders: [],
  });
  const [loading, setLoading] = useState(false);

  const loadMaintenanceData = async () => {
    try {
      setLoading(true);
      
      // Get first motor (assuming single motor for now)
      const motors = await DatabaseService.getMotors();
      if (motors.length === 0) {
        navigation.replace('AddMotor');
        return;
      }

      const motor = motors[0];
      const perawatan = await DatabaseService.getPerawatanByMotorId(motor.motor_id!);
      const reminders = await DatabaseService.getUpcomingReminders(motor.motor_id);

      setData({
        motor,
        perawatan,
        reminders,
      });
    } catch (error) {
      console.error('Error loading maintenance data:', error);
      Alert.alert('Error', 'Gagal memuat data perawatan');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMaintenanceData();
    }, [])
  );

  const handlePerformMaintenance = (perawatan: Perawatan) => {
    navigation.navigate('PerformMaintenance', {
      perawatanId: perawatan.perawatan_id!,
      jenisPerawatan: perawatan.jenis_perawatan,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getMaintenanceStatus = (perawatan: Perawatan) => {
    const reminder = data.reminders.find(r => r.perawatan_id === perawatan.perawatan_id);
    
    if (!reminder) {
      return { status: 'no_reminder', color: '#666', text: 'Belum ada jadwal' };
    }

    const reminderDate = new Date(reminder.tanggal_reminder);
    const today = new Date();
    const diffTime = reminderDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'overdue', color: '#F44336', text: `Tertunda ${Math.abs(diffDays)} hari` };
    } else if (diffDays <= 7) {
      return { status: 'urgent', color: '#FF9800', text: `${diffDays} hari lagi` };
    } else {
      return { status: 'upcoming', color: '#4CAF50', text: `${diffDays} hari lagi` };
    }
  };

  const getMaintenanceIcon = (jenisPerawatan: string) => {
    switch (jenisPerawatan.toLowerCase()) {
      case 'ganti oli mesin':
        return '🛢️';
      case 'ganti oli gear':
        return '⚙️';
      case 'cek ban':
        return '🚗';
      case 'ganti filter udara':
        return '💨';
      case 'cek rem':
        return '🛑';
      default:
        return '🔧';
    }
  };

  const getNextMaintenanceKm = (perawatan: Perawatan) => {
    if (!data.motor || !perawatan.interval_km) return null;
    
    const lastKm = perawatan.tanggal_terakhir ? 0 : 0; // Simplified, you might want to track last maintenance KM
    return lastKm + perawatan.interval_km;
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadMaintenanceData} />
      }>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perawatan Motor</Text>
        <Text style={styles.headerSubtitle}>
          {data.motor ? data.motor.nama_motor : 'Loading...'}
        </Text>
      </View>

      {/* Summary Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>📊 Ringkasan Perawatan</Text>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {data.reminders.filter(r => {
                const reminderDate = new Date(r.tanggal_reminder);
                const today = new Date();
                return reminderDate < today;
              }).length}
            </Text>
            <Text style={styles.summaryLabel}>Tertunda</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {data.reminders.filter(r => {
                const reminderDate = new Date(r.tanggal_reminder);
                const today = new Date();
                const diffTime = reminderDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays >= 0 && diffDays <= 7;
              }).length}
            </Text>
            <Text style={styles.summaryLabel}>Mendesak</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{data.perawatan.length}</Text>
            <Text style={styles.summaryLabel}>Total Item</Text>
          </View>
        </View>
      </View>

      {/* Maintenance List */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>🔧 Daftar Perawatan</Text>
        </View>
        
        {data.perawatan.map((perawatan, index) => {
          const status = getMaintenanceStatus(perawatan);
          const nextKm = getNextMaintenanceKm(perawatan);
          
          return (
            <View key={index} style={styles.maintenanceItem}>
              <View style={styles.maintenanceHeader}>
                <View style={styles.maintenanceTitle}>
                  <Text style={styles.maintenanceIcon}>
                    {getMaintenanceIcon(perawatan.jenis_perawatan)}
                  </Text>
                  <Text style={styles.maintenanceName}>
                    {perawatan.jenis_perawatan}
                  </Text>
                </View>
                <View style={[styles.statusBadge, {backgroundColor: status.color}]}>
                  <Text style={styles.statusText}>{status.text}</Text>
                </View>
              </View>
              
              <View style={styles.maintenanceDetails}>
                {perawatan.tanggal_terakhir && (
                  <Text style={styles.detailText}>
                    Terakhir: {formatDate(perawatan.tanggal_terakhir)}
                  </Text>
                )}
                
                <View style={styles.intervalInfo}>
                  {perawatan.interval_km && (
                    <Text style={styles.intervalText}>
                      📏 Setiap {perawatan.interval_km.toLocaleString()} km
                    </Text>
                  )}
                  {perawatan.interval_hari && (
                    <Text style={styles.intervalText}>
                      📅 Setiap {perawatan.interval_hari} hari
                    </Text>
                  )}
                </View>
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.actionButton,
                  status.status === 'overdue' && styles.urgentButton
                ]}
                onPress={() => handlePerformMaintenance(perawatan)}>
                <Text style={styles.actionButtonText}>
                  {status.status === 'overdue' ? 'Lakukan Sekarang!' : 'Lakukan Perawatan'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
        
        {data.perawatan.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Belum ada data perawatan.{'\n'}
              Tambahkan motor untuk memulai tracking perawatan.
            </Text>
          </View>
        )}
      </View>

      {/* Tips Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>💡 Tips Perawatan</Text>
        </View>
        <Text style={styles.tipsText}>
          • Lakukan perawatan rutin sesuai jadwal untuk menjaga performa motor{'\n'}
          • Update odometer secara berkala agar reminder akurat{'\n'}
          • Simpan nota service untuk tracking yang lebih baik{'\n'}
          • Jangan tunda perawatan yang sudah jatuh tempo
        </Text>
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  maintenanceItem: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  maintenanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  maintenanceTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  maintenanceIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  maintenanceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  maintenanceDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  intervalInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  intervalText: {
    fontSize: 14,
    color: '#666',
    marginRight: 16,
    marginBottom: 4,
  },
  actionButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  urgentButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  tipsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default MaintenanceScreen;