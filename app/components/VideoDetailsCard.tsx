import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Application from 'expo-application';
import { incrementLikes, incrementViews, incrementClicks, incrementGlobalMetrics, incrementUserMetrics } from '../services/firebaseConfig';

interface VideoDetailsCardProps {
  campaignId: string;
  title: string;
  description: string;
  link: string;
  linkText: string;
}

export const VideoDetailsCard: React.FC<VideoDetailsCardProps> = ({ campaignId, title, description, link, linkText }) => {
  const [isLiked, setIsLiked] = useState(false);
  const deviceId = Application.getAndroidId();


  useEffect(() => {
    const incrementView = async () => {
      try {
        // Incrementar métricas globales y por usuario
        await incrementGlobalMetrics(campaignId, 'view');
        await incrementUserMetrics(campaignId, deviceId, 'view'); // Reemplaza 'userId123' con el ID real del usuario
      } catch (error) {
        console.error('Error al incrementar vistas:', error);
      }
    };
  
    incrementView();
  }, [campaignId]);

  const toggleLike = async () => {
    try {
      if (!isLiked) {
        // Incrementar métricas globales y por usuario
        await incrementGlobalMetrics(campaignId, 'like');
        await incrementUserMetrics(campaignId, deviceId, 'like'); // Reemplaza 'userId123' con el ID real del usuario
        setIsLiked(true);
      } else {
        Alert.alert('Ya has dado Me Gusta a este video');
      }
    } catch (error) {
      console.error('Error al incrementar Me Gusta:', error);
      Alert.alert('Error', 'No se pudo registrar tu Me Gusta. Por favor, intenta de nuevo.');
    }
  };
  
  const handleLinkPress = async () => {
    try {
      // Incrementar métricas globales y por usuario
      await incrementGlobalMetrics(campaignId, 'click');
      await incrementUserMetrics(campaignId, deviceId, 'click'); // Reemplaza 'userId123' con el ID real del usuario
      Linking.openURL(link);
    } catch (error) {
      console.error('Error al incrementar clics:', error);
      Alert.alert('Error', 'No se pudo abrir el enlace. Por favor, intenta de nuevo.');
    }
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={handleLinkPress}
        >
          <Text style={styles.linkText}>{linkText}</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.likeButton}
          onPress={toggleLike}
        >
          <Ionicons 
            name={isLiked ? "heart" : "heart-outline"} 
            size={24} 
            color={isLiked ? "#E74C3C" : "#666666"} 
          />
          <Text style={styles.likeText}>Me gusta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    width: width - 32,
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 24,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  linkText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginRight: 8,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  likeText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
});

