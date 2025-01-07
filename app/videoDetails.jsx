import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { VideoDetailsCard } from './components/VideoDetailsCard';

export default function VideoDetails() {
  const { campaignsDetails } = useLocalSearchParams();
  const campaigns = JSON.parse(campaignsDetails || '[]');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.title}>Campañas Activas</Text>
        {campaigns.map((campaign, index) => (
          <VideoDetailsCard
            key={index}
            title={campaign.descriptionTitle}
            description={campaign.description}
            link={campaign.link}
            linkText={campaign.linkText}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
    textAlign: 'center',
  },
});

