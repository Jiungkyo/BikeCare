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
import {useRoute, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import DatabaseService from '../services/DatabaseService';
import {RootStackParamList} from '../navigation/AppNavigator';

type PerformMaintenanceScreenRouteProp = RouteProp<
  RootStackParamList,
  'PerformMaintenance'
>;

type PerformMaintenanceScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'PerformMaintenance'
>;

const PerformMaintenanceScreen: React.FC = () => {
  const route = useRoute<PerformMaintenanceScreenRouteProp>();
  const navigation = useNavigation<PerformMaintenanceScreenNavigationProp>();
  const {perawatanId, jenisPerawatan} = route.params;

  const [catatan, setCatatan] = useState('');
  const [loading, setLoading] = useState(false);

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

  const getDefaultNotes = (jenisPerawatan: string) => {
    switch (jenisPerawatan.toLowerCase()) {
      case 'ganti oli mesin':
        return 'Oli mesin diganti dengan oli SAE 10W-40. Kondisi oli lama: normal.';
      case 'ganti oli gear':
        return 'Oli gear diganti dengan oli transmisi baru. Tidak ada masalah pada gear.';
      case 'cek ban':
        return 'Tekanan ban depan dan belakang sudah disesuaikan. Kondisi ban masih baik.';
      case 'ganti filter udara':
        return 'Filter udara dibersihkan/diganti. Sirkulasi udara ke mesin lancar.';
      case 'cek rem':
        return 'Sistem rem diperiksa. Kampas rem masih tebal, tidak ada masalah.';
      default:
        return 'Perawatan telah dilakukan sesuai standar.';
    }
  };

  const handleUseDefaultNotes = () => {
    setCatatan(getDefaultNotes(jenisPerawatan));
  };

  const handlePerformMaintenance = async () => {
    if (!catatan.trim()) {
      Alert.alert('Peringatan', 'Mohon tambahkan catatan perawatan');
      return;
    }

    Alert.alert(
      'Konfirmasi',
      `Apakah Anda yakin telah melakukan perawatan "${jenisPerawatan}"?`,
      [
        {text: 'Batal', style: 'cancel'},
        {text: 'Ya, Sudah Selesai', onPress: () => saveMaintenance()},
      ]
    );
  };

  const saveMaintenance = async () => {
    setLoading(true);
    try {
      await DatabaseService.performMaintenance(perawatanId, catatan.trim());

      Alert.alert(
        'Berhasil!',
        'Perawatan berhasil dicatat dan reminder telah diperbarui.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      console.error('Error performing maintenance:', error);
      Alert.alert('Error', 'Gagal menyimpan data perawatan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header Card */}
        <View style={styles.card}>
          <View style={styles.headerContent}>
            <Text style={styles.maintenanceIcon}>
              {getMaintenanceIcon(jenisPerawatan)}
            </Text>
            <Text style={styles.maintenanceTitle}>{jenisPerawatan}</Text>
            <Text style={styles.dateText}>
              📅 {getCurrentDate()}
            </Text>
          </View>
        </View>

        {/* Checklist Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>✅ Checklist Perawatan</Text>
            <Text style={styles.cardSubtitle}>
              Pastikan semua langkah berikut sudah dilakukan:
            </Text>
          </View>
          
          <View style={styles.checklistContainer}>
            {jenisPerawatan.toLowerCase().includes('oli') && (
              <>
                <Text style={styles.checklistItem}>
                  • Mesin dalam kondisi hangat (tidak panas)
                </Text>
                <Text style={styles.checklistItem}>
                  • Oli lama sudah dikuras habis
                </Text>
                <Text style={styles.checklistItem}>
                  • Filter oli diganti (jika perlu)
                </Text>
                <Text style={styles.checklistItem}>
                  • Oli baru sesuai spesifikasi motor
                </Text>
                <Text style={styles.checklistItem}>
                  • Level oli sudah sesuai
                </Text>
              </>
            )}
            
            {jenisPerawatan.toLowerCase().includes('ban') && (
              <>
                <Text style={styles.checklistItem}>
                  • Tekanan ban sesuai standar
                </Text>
                <Text style={styles.checklistItem}>
                  • Kondisi tapak ban diperiksa
                </Text>
                <Text style={styles.checklistItem}>
                  • Tidak ada paku atau benda asing
                </Text>
                <Text style={styles.checklistItem}>
                  • Dinding ban tidak retak
                </Text>
              </>
            )}
            
            {jenisPerawatan.toLowerCase().includes('rem') && (
              <>
                <Text style={styles.checklistItem}>
                  • Ketebalan kampas rem diperiksa
                </Text>
                <Text style={styles.checklistItem}>
                  • Minyak rem masih cukup
                </Text>
                <Text style={styles.checklistItem}>
                  • Tidak ada kebocoran
                </Text>
                <Text style={styles.checklistItem}>
                  • Responsif rem normal
                </Text>
              </>
            )}
            
            {jenisPerawatan.toLowerCase().includes('filter') && (
              <>
                <Text style={styles.checklistItem}>
                  • Filter lama sudah dilepas
                </Text>
                <Text style={styles.checklistItem}>
                  • Filter baru sesuai tipe motor
                </Text>
                <Text style={styles.checklistItem}>
                  • Pemasangan filter benar
                </Text>
                <Text style={styles.checklistItem}>
                  • Sirkulasi udara lancar
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Notes Input Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>📝 Catatan Perawatan</Text>
            <Text style={styles.cardSubtitle}>
              Tambahkan detail perawatan yang telah dilakukan
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.defaultButton}
            onPress={handleUseDefaultNotes}>
            <Text style={styles.defaultButtonText}>
              💡 Gunakan Catatan Default
            </Text>
          </TouchableOpacity>

          <TextInput
            style={styles.textArea}
            placeholder="Contoh: Oli mesin diganti dengan Shell AX7 10W-40. Kondisi mesin normal, tidak ada kebocoran."
            value={catatan}
            onChangeText={setCatatan}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          <Text style={styles.helper}>
            💡 Tips: Catat merek suku cadang, kondisi komponen, dan hal penting lainnya
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handlePerformMaintenance}
            disabled={loading}>
            <Text style={styles.buttonText}>
              {loading ? 'Menyimpan...' : '✅ Selesai Perawatan'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.goBack()}
            disabled={loading}>
            <Text style={styles.secondaryButtonText}>Batal</Text>
          </TouchableOpacity>
        </View>

        {/* Warning */}
        <View style={styles.warningCard}>
          <Text style={styles.warningText}>
            ⚠️ Pastikan perawatan benar-benar sudah dilakukan sebelum menandai sebagai selesai. 
            Data ini akan mempengaruhi jadwal perawatan selanjutnya.
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
  headerContent: {
    alignItems: 'center',
  },
  maintenanceIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  maintenanceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  cardHeader: {
    marginBottom: 12,
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
  checklistContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  checklistItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
    lineHeight: 20,
  },
  defaultButton: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  defaultButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
  },
  textArea: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 120,
  },
  helper: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  actionContainer: {
    marginBottom: 16,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  warningCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  warningText: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20,
  },
});

export default PerformMaintenanceScreen;