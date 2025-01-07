import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VideoDetailsCardProps {
  title: string;
  description: string;
  link: string;
  linkText: string;
}

export const VideoDetailsCard: React.FC<VideoDetailsCardProps> = ({ title, description, link, linkText }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => Linking.openURL(link)}
        >
          <Text style={styles.linkText}>{linkText}</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
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
});

