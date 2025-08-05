import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';

interface TipCategory {
  title: string;
  icon: string;
  tips: string[];
}

const TipsScreen: React.FC = () => {
  const tipCategories: TipCategory[] = [
    {
      title: 'Perawatan Oli Mesin',
      icon: '🛢️',
      tips: [
        'Ganti oli mesin setiap 3.000 km atau 3 bulan',
        'Gunakan oli sesuai spesifikasi motor (SAE 10W-40 untuk motor bebek)',
        'Periksa level oli minimal seminggu sekali',
        'Ganti oli saat mesin hangat untuk hasil terbaik',
        'Jangan lupa ganti filter oli bersamaan dengan oli'
      ]
    },
    {
      title: 'Perawatan Ban',
      icon: '🚗',
      tips: [
        'Periksa tekanan ban setiap minggu',
        'Tekanan ideal: depan 28-32 psi, belakang 32-36 psi',
        'Rotasi ban setiap 5.000 km untuk keausan merata',
        'Ganti ban jika kedalaman alur < 1.6mm',
        'Hindari pengereman mendadak untuk memperpanjang usia ban'
      ]
    },
    {
      title: 'Sistem Rem',
      icon: '🛑',
      tips: [
        'Periksa ketebalan kampas rem secara berkala',
        'Ganti kampas rem jika ketebalan < 2mm',
        'Periksa level minyak rem setiap bulan',
        'Bleeding rem setiap 2 tahun atau jika terasa spons',
        'Jangan tunggu bunyi decit untuk ganti kampas rem'
      ]
    },
    {
      title: 'Filter Udara',
      icon: '💨',
      tips: [
        'Bersihkan filter udara setiap 2.500 km',
        'Ganti filter udara setiap 5.000 km',
        'Filter kotor mengurangi performa mesin 10-15%',
        'Gunakan angin bertekanan untuk membersihkan',
        'Filter basah harus benar-benar kering sebelum dipasang'
      ]
    },
    {
      title: 'Perawatan Rantai',
      icon: '🔗',
      tips: [
        'Bersihkan dan lumasi rantai setiap 500 km',
        'Periksa kekencangan rantai setiap minggu',
        'Rantai tidak boleh terlalu kencang atau kendor',
        'Ganti rantai dan sprocket bersamaan',
        'Gunakan chain cleaner khusus untuk hasil optimal'
      ]
    },
    {
      title: 'Tips Umum',
      icon: '💡',
      tips: [
        'Lakukan service rutin sesuai jadwal',
        'Catat semua perawatan yang dilakukan',
        'Gunakan suku cadang original atau berkualitas',
        'Panaskan mesin 2-3 menit sebelum berkendara',
        'Hindari membawa beban berlebihan',
        'Park di tempat teduh untuk melindungi komponen plastik'
      ]
    }
  ];

  const safetyTips = [
    'Selalu matikan mesin saat melakukan perawatan',
    'Gunakan sarung tangan saat menangani oli dan bahan kimia',
    'Pastikan mesin dingin sebelum memeriksa oli',
    'Buang oli bekas di tempat yang tepat (jangan ke selokan)',
    'Simpan suku cadang di tempat kering dan sejuk',
    'Baca manual motor untuk spesifikasi yang tepat'
  ];

  const seasonalTips = [
    {
      season: 'Musim Hujan',
      icon: '🌧️',
      tips: [
        'Periksa kondisi ban lebih sering',
        'Bersihkan motor setelah kehujanan',
        'Periksa sistem kelistrikan dari korosi',
        'Gunakan cover motor saat parkir'
      ]
    },
    {
      season: 'Musim Kemarau',
      icon: '☀️',
      tips: [
        'Periksa level air radiator (motor berpendingin air)',
        'Park di tempat teduh',
        'Periksa tekanan ban lebih sering (udara mengembang)',
        'Bersihkan filter udara lebih sering karena debu'
      ]
    }
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tips & Edukasi</Text>
        <Text style={styles.headerSubtitle}>
          Panduan perawatan motor untuk pemula
        </Text>
      </View>

      {/* Main Tips Categories */}
      {tipCategories.map((category, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>{category.icon}</Text>
            <Text style={styles.cardTitle}>{category.title}</Text>
          </View>
          
          {category.tips.map((tip, tipIndex) => (
            <View key={tipIndex} style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      ))}

      {/* Safety Tips */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>🛡️</Text>
          <Text style={styles.cardTitle}>Tips Keselamatan</Text>
        </View>
        
        {safetyTips.map((tip, index) => (
          <View key={index} style={styles.tipItem}>
            <Text style={styles.safetyBullet}>⚠️</Text>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>

      {/* Seasonal Tips */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>📅</Text>
          <Text style={styles.cardTitle}>Tips Musiman</Text>
        </View>
        
        {seasonalTips.map((season, index) => (
          <View key={index} style={styles.seasonSection}>
            <View style={styles.seasonHeader}>
              <Text style={styles.seasonIcon}>{season.icon}</Text>
              <Text style={styles.seasonTitle}>{season.season}</Text>
            </View>
            
            {season.tips.map((tip, tipIndex) => (
              <View key={tipIndex} style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* Emergency Tips */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>🚨</Text>
          <Text style={styles.cardTitle}>Tips Darurat</Text>
        </View>
        
        <View style={styles.emergencySection}>
          <Text style={styles.emergencySubtitle}>🔧 Motor Tidak Mau Hidup:</Text>
          <Text style={styles.emergencyText}>
            1. Periksa bahan bakar{'\n'}
            2. Cek aki dan koneksi kabel{'\n'}
            3. Periksa busi{'\n'}
            4. Pastikan kunci kontak dalam posisi ON
          </Text>
        </View>
        
        <View style={styles.emergencySection}>
          <Text style={styles.emergencySubtitle}>🛑 Rem Tidak Pakem:</Text>
          <Text style={styles.emergencyText}>
            1. Periksa level minyak rem{'\n'}
            2. Cek kampas rem{'\n'}
            3. Bleeding sistem rem{'\n'}
            4. Segera ke bengkel jika masih bermasalah
          </Text>
        </View>
      </View>

      {/* Contact Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>📞 Bantuan Darurat</Text>
        <Text style={styles.infoText}>
          Jika mengalami masalah serius dengan motor:{'\n\n'}
          • Hubungi bengkel langganan{'\n'}
          • Gunakan layanan derek terdekat{'\n'}
          • Jangan paksakan berkendara jika tidak aman{'\n'}
          • Simpan nomor bengkel 24 jam di HP
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  tipBullet: {
    fontSize: 16,
    color: '#2196F3',
    marginRight: 8,
    marginTop: 2,
  },
  safetyBullet: {
    fontSize: 14,
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    flex: 1,
  },
  seasonSection: {
    marginBottom: 16,
  },
  seasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 8,
  },
  seasonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  seasonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  emergencySection: {
    marginBottom: 16,
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  emergencySubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 8,
  },
  emergencyText: {
    fontSize: 14,
    color: '#BF360C',
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#E8F5E8',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#388E3C',
    lineHeight: 20,
  },
});

export default TipsScreen;