import React, {useState} from 'react';
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
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import DatabaseService from '../services/DatabaseService';
import {RootStackParamList} from '../navigation/AppNavigator';

type AddMotorScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'AddMotor'
>;

const AddMotorScreen: React.FC = () => {
  const navigation = useNavigation<AddMotorScreenNavigationProp>();
  const [namaMotor, setNamaMotor] = useState('');
  const [tahunMotor, setTahunMotor] = useState('');
  const [kmAwal, setKmAwal] = useState('');
  const [loading, setLoading] = useState(false);

  const currentYear = new Date().getFullYear();

  const validateInput = () => {
    if (!namaMotor.trim()) {
      Alert.alert('Error', 'Nama motor harus diisi');
      return false;
    }

    if (tahunMotor && (isNaN(Number(tahunMotor)) || Number(tahunMotor) < 1950 || Number(tahunMotor) > currentYear)) {
      Alert.alert('Error', `Tahun motor harus antara 1950 - ${currentYear}`);
      return false;
    }

    if (kmAwal && (isNaN(Number(kmAwal)) || Number(kmAwal) < 0)) {
      Alert.alert('Error', 'Kilometer awal harus berupa angka positif');
      return false;
    }

    return true;
  };

  const handleSaveMotor = async () => {
    if (!validateInput()) return;

    setLoading(true);
    try {
      // Add motor to database
      const motorId = await DatabaseService.addMotor({
        nama_motor: namaMotor.trim(),
        tahun_motor: tahunMotor ? Number(tahunMotor) : undefined,
      });

      // Add initial odometer reading if provided
      if (kmAwal) {
        await DatabaseService.updateOdometer({
          motor_id: motorId,
          km_terakhir: Number(kmAwal),
        });
      }

      // Calculate initial reminders
      await DatabaseService.calculateAndCreateReminders(motorId);

      Alert.alert(
        'Berhasil!',
        'Motor berhasil ditambahkan. Selamat menggunakan BikeCare!',
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('Main'),
          },
        ],
      );
    } catch (error) {
      console.error('Error adding motor:', error);
      Alert.alert('Error', 'Gagal menambahkan motor. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.icon}>🏍️</Text>
          <Text style={styles.title}>Tambah Motor Anda</Text>
          <Text style={styles.subtitle}>
            Masukkan informasi motor untuk memulai tracking perawatan
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Motor *</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Honda Vario 150, Yamaha NMAX"
              value={namaMotor}
              onChangeText={setNamaMotor}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tahun Motor</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: 2020"
              value={tahunMotor}
              onChangeText={setTahunMotor}
              keyboardType="numeric"
              maxLength={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kilometer Saat Ini</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: 15000"
              value={kmAwal}
              onChangeText={setKmAwal}
              keyboardType="numeric"
            />
            <Text style={styles.helper}>
              Masukkan kilometer saat ini pada odometer motor Anda
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSaveMotor}
            disabled={loading}>
            <Text style={styles.buttonText}>
              {loading ? 'Menyimpan...' : 'Simpan Motor'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.note}>
            * Wajib diisi{'\n'}
            Data akan disimpan di device Anda dan dapat diubah kapan saja
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
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  icon: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    flex: 1,
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
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },
  helper: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
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
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AddMotorScreen;