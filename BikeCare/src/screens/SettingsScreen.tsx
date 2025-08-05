import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import DatabaseService from '../services/DatabaseService';
import {Motor, Odometer} from '../types';
import {RootStackParamList} from '../navigation/AppNavigator';

type SettingsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Main'
>;

interface SettingsData {
  motor: Motor | null;
  odometer: Odometer | null;
  totalHistory: number;
  totalReminders: number;
}

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [data, setData] = useState<SettingsData>({
    motor: null,
    odometer: null,
    totalHistory: 0,
    totalReminders: 0,
  });
  const [loading, setLoading] = useState(false);

  const loadSettingsData = async () => {
    try {
      setLoading(true);
      
      const motors = await DatabaseService.getMotors();
      if (motors.length === 0) {
        navigation.replace('AddMotor');
        return;
      }

      const motor = motors[0];
      const odometer = await DatabaseService.getOdometerByMotorId(motor.motor_id!);
      const history = await DatabaseService.getAllHistory();
      const reminders = await DatabaseService.getUpcomingReminders();

      setData({
        motor,
        odometer,
        totalHistory: history.length,
        totalReminders: reminders.length,
      });
    } catch (error) {
      console.error('Error loading settings data:', error);
      Alert.alert('Error', 'Gagal memuat data pengaturan');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSettingsData();
    }, [])
  );

  const handleResetAllData = () => {
    Alert.alert(
      'Hapus Semua Data?',
      'Peringatan: Semua data motor, perawatan, dan riwayat akan dihapus permanen. Tindakan ini tidak dapat dibatalkan!',
      [
        {text: 'Batal', style: 'cancel'},
        {
          text: 'Ya, Hapus Semua',
          style: 'destructive',
          onPress: () => confirmResetData(),
        },
      ]
    );
  };

  const confirmResetData = () => {
    Alert.alert(
      'Konfirmasi Terakhir',
      'Apakah Anda benar-benar yakin ingin menghapus SEMUA data? Data yang terhapus tidak dapat dikembalikan.',
      [
        {text: 'Batal', style: 'cancel'},
        {
          text: 'Ya, Saya Yakin',
          style: 'destructive',
          onPress: () => performReset(),
        },
      ]
    );
  };

  const performReset = async () => {
    try {
      setLoading(true);
      await DatabaseService.resetAllData();
      
      Alert.alert(
        'Berhasil!',
        'Semua data telah dihapus. Aplikasi akan kembali ke halaman awal.',
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('AddMotor'),
          },
        ],
      );
    } catch (error) {
      console.error('Error resetting data:', error);
      Alert.alert('Error', 'Gagal menghapus data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculateReminders = async () => {
    if (!data.motor) return;

    try {
      setLoading(true);
      await DatabaseService.calculateAndCreateReminders(data.motor.motor_id!);
      await loadSettingsData();
      
      Alert.alert('Berhasil!', 'Reminder telah dihitung ulang berdasarkan data terbaru.');
    } catch (error) {
      console.error('Error recalculating reminders:', error);
      Alert.alert('Error', 'Gagal menghitung ulang reminder.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const appVersion = '1.0.0';

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadSettingsData} />
      }>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pengaturan</Text>
        <Text style={styles.headerSubtitle}>
          Kelola data dan pengaturan aplikasi
        </Text>
      </View>

      {/* Motor Info */}
      {data.motor && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🏍️ Informasi Motor</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nama Motor</Text>
            <Text style={styles.infoValue}>{data.motor.nama_motor}</Text>
          </View>
          
          {data.motor.tahun_motor && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tahun</Text>
              <Text style={styles.infoValue}>{data.motor.tahun_motor}</Text>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kilometer Terakhir</Text>
            <Text style={styles.infoValue}>
              {data.odometer?.km_terakhir?.toLocaleString() || 'Belum diinput'} km
            </Text>
          </View>
          
          {data.odometer?.tanggal_update && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Update Terakhir</Text>
              <Text style={styles.infoValue}>
                {formatDate(data.odometer.tanggal_update)}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Data Statistics */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>📊 Statistik Data</Text>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{data.totalHistory}</Text>
            <Text style={styles.statLabel}>Riwayat Perawatan</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{data.totalReminders}</Text>
            <Text style={styles.statLabel}>Reminder Aktif</Text>
          </View>
        </View>
      </View>

      {/* Data Management */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>🔧 Kelola Data</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleRecalculateReminders}>
          <Text style={styles.actionButtonIcon}>🔄</Text>
          <View style={styles.actionButtonContent}>
            <Text style={styles.actionButtonTitle}>Hitung Ulang Reminder</Text>
            <Text style={styles.actionButtonSubtitle}>
              Perbaiki jadwal perawatan berdasarkan data terbaru
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.updateButton]}
          onPress={() => data.motor && navigation.navigate('UpdateOdometer', {motorId: data.motor.motor_id!})}>
          <Text style={styles.actionButtonIcon}>📏</Text>
          <View style={styles.actionButtonContent}>
            <Text style={styles.actionButtonTitle}>Update Odometer</Text>
            <Text style={styles.actionButtonSubtitle}>
              Perbarui kilometer terbaru motor Anda
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Danger Zone */}
      <View style={styles.dangerCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.dangerTitle}>⚠️ Zona Berbahaya</Text>
        </View>
        
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            Tindakan di bawah ini akan menghapus semua data secara permanen dan tidak dapat dibatalkan.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.dangerButton}
          onPress={handleResetAllData}>
          <Text style={styles.dangerButtonIcon}>🗑️</Text>
          <View style={styles.actionButtonContent}>
            <Text style={styles.dangerButtonTitle}>Hapus Semua Data</Text>
            <Text style={styles.dangerButtonSubtitle}>
              Reset aplikasi ke kondisi awal (tidak dapat dibatalkan)
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>ℹ️ Informasi Aplikasi</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nama Aplikasi</Text>
          <Text style={styles.infoValue}>BikeCare</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Versi</Text>
          <Text style={styles.infoValue}>{appVersion}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Deskripsi</Text>
          <Text style={styles.infoValue}>Aplikasi perawatan motor offline</Text>
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.aboutText}>
            BikeCare membantu Anda mengatur jadwal perawatan motor dengan mudah. 
            Semua data tersimpan secara lokal di device Anda untuk privasi maksimal.
          </Text>
        </View>
      </View>

      {/* Features Info */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>✨ Fitur Utama</Text>
        </View>
        
        <View style={styles.featuresList}>
          <Text style={styles.featureItem}>• Tracking perawatan rutin</Text>
          <Text style={styles.featureItem}>• Reminder otomatis</Text>
          <Text style={styles.featureItem}>• Riwayat perawatan lengkap</Text>
          <Text style={styles.featureItem}>• Tips perawatan motor</Text>
          <Text style={styles.featureItem}>• Data tersimpan offline</Text>
          <Text style={styles.featureItem}>• Tanpa login atau registrasi</Text>
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
  dangerCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F44336',
    shadowColor: '#F44336',
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
  dangerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F44336',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  updateButton: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  actionButtonIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  actionButtonContent: {
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  actionButtonSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  warningBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  warningText: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  dangerButtonIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  dangerButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D32F2F',
    marginBottom: 4,
  },
  dangerButtonSubtitle: {
    fontSize: 14,
    color: '#F44336',
    lineHeight: 20,
  },
  aboutSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
  },
  featuresList: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  featureItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
    lineHeight: 20,
  },
});

export default SettingsScreen;