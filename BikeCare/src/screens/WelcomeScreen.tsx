import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import DatabaseService from '../services/DatabaseService';
import {RootStackParamList} from '../navigation/AppNavigator';

type WelcomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Welcome'
>;

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database
      await DatabaseService.initDB();
      
      // Check if user has any motors
      const motors = await DatabaseService.getMotors();
      
      // Wait a moment to show the welcome screen
      setTimeout(() => {
        if (motors.length > 0) {
          // User has motors, go to main app
          navigation.replace('Main');
        } else {
          // No motors, go to add motor screen
          navigation.replace('AddMotor');
        }
      }, 2000);
    } catch (error) {
      console.error('Error initializing app:', error);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>BikeCare</Text>
        <Text style={styles.subtitle}>Perawatan Motor Jadi Mudah</Text>
        
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🏍️</Text>
        </View>
        
        <Text style={styles.description}>
          Kelola perawatan motor Anda dengan mudah.{'\n'}
          Jangan sampai terlewat jadwal servis!
        </Text>
        
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Memuat aplikasi...</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 40,
  },
  icon: {
    fontSize: 80,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default WelcomeScreen;