import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import DatabaseService from '../services/DatabaseService';
import {Motor, Odometer} from '../types';
import {RootStackParamList} from '../navigation/AppNavigator';

type UpdateOdometerScreenRouteProp = RouteProp<
  RootStackParamList,
  'UpdateOdometer'
>;

type UpdateOdometerScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'UpdateOdometer'
>;

const UpdateOdometerScreen: React.FC = () => {
  const route = useRoute<UpdateOdometerScreenRouteProp>();
  const navigation = useNavigation<UpdateOdometerScreenNavigationProp>();
  const {motorId} = route.params;

  const [motor, setMotor] = useState<Motor | null>(null);
  const [currentOdometer, setCurrentOdometer] = useState<Odometer | null>(null);
  const [newKm, setNewKm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const motorData = await DatabaseService.getMotorById(motorId);
      const odometerData = await DatabaseService.getOdometerByMotorId(motorId);
      
      setMotor(motorData);
      setCurrentOdometer(odometerData);
      
      // Pre-fill with current km if available
      if (odometerData?.km_terakhir) {
        setNewKm(odometerData.km_terakhir.toString());
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Gagal memuat data motor');
    }
  };

  const validateInput = () => {
    if (!newKm.trim()) {
      Alert.alert('Error', 'Kilometer harus diisi');
      return false;
    }

    const kmValue = Number(newKm);
    if (isNaN(kmValue) || kmValue < 0) {
      Alert.alert('Error', 'Kilometer harus berupa angka positif');
      return false;
    }

    if (currentOdometer?.km_terakhir && kmValue < currentOdometer.km_terakhir) {
      Alert.alert(
        'Peringatan',
        `Kilometer baru (${kmValue.toLocaleString()}) lebih kecil dari kilometer terakhir (${currentOdometer.km_terakhir.toLocaleString()}). Apakah Anda yakin?`,
        [
          {text: 'Batal', style: 'cancel'},
          {text: 'Ya, Lanjutkan', onPress: () => handleSave()},
        ]
      );
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await DatabaseService.updateOdometer({
        motor_id: motorId,
        km_terakhir: Number(newKm),
      });

      // Recalculate reminders after odometer update
      await DatabaseService.calculateAndCreateReminders(motorId);

      Alert.alert(
        'Berhasil!',
        'Odometer berhasil diperbarui dan reminder telah dihitung ulang.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      console.error('Error updating odometer:', error);
      Alert.alert('Error', 'Gagal memperbarui odometer. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (validateInput()) {
      handleSave();
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

  const calculateDistance = () => {
    if (currentOdometer?.km_terakhir && newKm) {
      const current = currentOdometer.km_terakhir;
      const newValue = Number(newKm);
      if (!isNaN(newValue) && newValue >= current) {
        return newValue - current;
      }
    }
    return 0;
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Motor Info */}
        {motor && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>🏍️ {motor.nama_motor}</Text>
              {motor.tahun_motor && (
                <Text style={styles.cardSubtitle}>Tahun {motor.tahun_motor}</Text>
              )}
            </View>
          </View>
        )}

        {/* Current Odometer Info */}
        {currentOdometer && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>📊 Odometer Saat Ini</Text>
            </View>
            <View style={styles.currentInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Kilometer Terakhir</Text>
                <Text style={styles.infoValue}>
                  {currentOdometer.km_terakhir?.toLocaleString() || 'Belum ada data'} km
                </Text>
              </View>
              {currentOdometer.tanggal_update && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Update Terakhir</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(currentOdometer.tanggal_update)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Input Form */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🔄 Update Odometer</Text>
            <Text style={styles.cardSubtitle}>
              Masukkan pembacaan odometer terbaru
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kilometer Baru</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan kilometer saat ini"
              value={newKm}
              onChangeText={setNewKm}
              keyboardType="numeric"
              autoFocus
            />
            
            {calculateDistance() > 0 && (
              <View style={styles.distanceInfo}>
                <Text style={styles.distanceText}>
                  📏 Jarak tempuh: {calculateDistance().toLocaleString()} km
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}>
            <Text style={styles.buttonText}>
              {loading ? 'Menyimpan...' : 'Update Odometer'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.note}>
            💡 Tips:{'\n'}
            • Pastikan angka yang dimasukkan sesuai dengan odometer motor{'\n'}
            • Update odometer secara berkala untuk reminder yang akurat{'\n'}
            • Sistem akan menghitung ulang jadwal perawatan otomatis
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  currentInfo: {
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  distanceInfo: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  note: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});

export default UpdateOdometerScreen;