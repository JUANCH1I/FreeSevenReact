import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native'
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'
import { formatTime } from './utils/utils';

const GOALS = [
  {
    title: 'Objetivo 1',
    description: 'Ver 1 hora de contenido',
    status: 'completed',
  },
  {
    title: 'Objetivo 2',
    description: 'Ver 5 horas de contenido',
    status: 'pending',
  },
  {
    title: 'Objetivo 3',
    description: 'Ver 10 horas de contenido',
    status: 'pending',
  },
]

export default function Goals() {
  const { totalTimeWatched } = useLocalSearchParams();
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle='dark-content' />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.pageTitle}>Objetivos</Text>
        <Text style={styles.totalTimeWatched}>
          <Text style={styles.totalTimeWatchedText}>Tiempo total: </Text>
          <Ionicons name='time-outline' size={24} color='#4A90E2' />{' '}
          {formatTime(totalTimeWatched)}
        </Text>
        {GOALS.map((goal, index) => (
          <View key={index} style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              {goal.status === 'pending' ? (
                <Ionicons name='time-outline' size={24} color='#FFA500' />
              ) : (
                <Ionicons
                  name='checkmark-circle-outline'
                  size={24}
                  color='#4A90E2'
                />
              )}
            </View>
            <Text style={styles.goalDescription}>{goal.description}</Text>
            <Text style={styles.goalStatus}>
              {goal.status === 'pending' ? 'Pendiente' : 'Completado'}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flexGrow: 1,
    padding: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
    textAlign: 'center',
  },
  totalTimeWatched: {
    fontSize: 18,
    color: '#000000',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  totalTimeWatchedText: {
    color: '#4A90E2',
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  goalDescription: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  goalStatus: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: 'bold',
  },
})
