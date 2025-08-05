import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import DatabaseService from '../services/DatabaseService';

interface HistoryItem {
  history_id?: number;
  perawatan_id: number;
  tanggal_perawatan?: string;
  catatan?: string;
  jenis_perawatan: string;
  nama_motor: string;
}

const HistoryScreen: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const historyData = await DatabaseService.getAllHistory();
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading history:', error);
      Alert.alert('Error', 'Gagal memuat riwayat perawatan');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
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

  const groupHistoryByMonth = (history: HistoryItem[]) => {
    const grouped: {[key: string]: HistoryItem[]} = {};
    
    history.forEach(item => {
      if (!item.tanggal_perawatan) return;
      const date = new Date(item.tanggal_perawatan);
      const monthKey = date.toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric',
      });
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(item);
    });
    
    return grouped;
  };

  const groupedHistory = groupHistoryByMonth(history);
  const monthKeys = Object.keys(groupedHistory).sort((a, b) => {
    // Sort months in descending order (newest first)
    const monthA = new Date(groupedHistory[a][0].tanggal_perawatan || '');
    const monthB = new Date(groupedHistory[b][0].tanggal_perawatan || '');
    return monthB.getTime() - monthA.getTime();
  });

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadHistory} />
      }>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Riwayat Perawatan</Text>
        <Text style={styles.headerSubtitle}>
          {history.length} perawatan telah dilakukan
        </Text>
      </View>

      {/* Statistics Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>📊 Statistik</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{history.length}</Text>
            <Text style={styles.statLabel}>Total Perawatan</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {history.filter(h => h.jenis_perawatan.toLowerCase().includes('oli')).length}
            </Text>
            <Text style={styles.statLabel}>Ganti Oli</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
                             {history.filter(h => 
                 h.tanggal_perawatan &&
                 new Date(h.tanggal_perawatan).getMonth() === new Date().getMonth() &&
                 new Date(h.tanggal_perawatan).getFullYear() === new Date().getFullYear()
               ).length}
            </Text>
            <Text style={styles.statLabel}>Bulan Ini</Text>
          </View>
        </View>
      </View>

      {/* History Timeline */}
      {monthKeys.length > 0 ? (
        monthKeys.map(monthKey => (
          <View key={monthKey} style={styles.monthSection}>
            <Text style={styles.monthHeader}>{monthKey}</Text>
            
            {groupedHistory[monthKey].map((item, index) => (
              <View key={item.history_id} style={styles.historyCard}>
                <View style={styles.timelineIndicator}>
                  <View style={styles.timelineDot} />
                  {index !== groupedHistory[monthKey].length - 1 && (
                    <View style={styles.timelineLine} />
                  )}
                </View>
                
                <View style={styles.historyContent}>
                  <View style={styles.historyHeader}>
                    <View style={styles.historyTitle}>
                      <Text style={styles.historyIcon}>
                        {getMaintenanceIcon(item.jenis_perawatan)}
                      </Text>
                      <Text style={styles.historyName}>
                        {item.jenis_perawatan}
                      </Text>
                    </View>
                    <Text style={styles.historyDate}>
                      {item.tanggal_perawatan ? formatDate(item.tanggal_perawatan) : 'Tanggal tidak tersedia'}
                    </Text>
                  </View>
                  
                  {item.catatan && (
                    <View style={styles.notesContainer}>
                      <Text style={styles.notesLabel}>📝 Catatan:</Text>
                      <Text style={styles.notesText}>{item.catatan}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>📅</Text>
          <Text style={styles.emptyStateTitle}>Belum Ada Riwayat</Text>
          <Text style={styles.emptyStateText}>
            Riwayat perawatan akan muncul di sini setelah Anda melakukan perawatan pertama.
            {'\n\n'}
            Mulai dengan melakukan perawatan dari menu Perawatan.
          </Text>
        </View>
      )}

      {/* Tips Card */}
      {history.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>💡 Tips Riwayat</Text>
          </View>
          <Text style={styles.tipsText}>
            • Riwayat perawatan membantu menganalisis pola kerusakan motor{'\n'}
            • Catat detail perawatan untuk referensi ke depan{'\n'}
            • Gunakan riwayat saat konsultasi dengan mekanik{'\n'}
            • Riwayat lengkap dapat meningkatkan nilai jual motor
          </Text>
        </View>
      )}
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  monthSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  monthHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timelineIndicator: {
    alignItems: 'center',
    paddingTop: 20,
    width: 40,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 4,
  },
  historyContent: {
    flex: 1,
    padding: 16,
  },
  historyHeader: {
    marginBottom: 12,
  },
  historyTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  historyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  historyDate: {
    fontSize: 14,
    color: '#666',
  },
  notesContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
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

export default HistoryScreen;