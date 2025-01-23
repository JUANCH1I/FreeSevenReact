import React, { useEffect, useState } from "react"
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, Alert, Dimensions } from "react-native"
import { useLocalSearchParams } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { formatTime } from "./utils/utils"
import * as Progress from "react-native-progress"
import { db } from "./services/firebaseConfig"
import { doc, getDoc } from "firebase/firestore"
import { LinearGradient } from "expo-linear-gradient"

const DEFAULT_GOALS = [
  { title: "Objetivo 1", description: "Ver 1 hora de contenido", hours: 1 },
  { title: "Objetivo 2", description: "Ver 5 horas de contenido", hours: 5 },
  { title: "Objetivo 3", description: "Ver 10 horas de contenido", hours: 10 },
]

const { width } = Dimensions.get("window")

export default function Goals() {
  const { androidId } = useLocalSearchParams()
  const [goals, setGoals] = useState([])
  const [totalTimeWatched, setTotalTimeWatched] = useState(0)

  useEffect(() => {
    loadTotalTimeWatched()
  }, [])

  const loadTotalTimeWatched = async () => {
    try {
      const totalTimeRef = doc(db, "users", androidId)
      const totalTimeSnapshot = await getDoc(totalTimeRef)
      const totalTime = totalTimeSnapshot.data().totalWatchTime || 0
      setTotalTimeWatched(totalTime)
    } catch (error) {
      console.error("Error al cargar tiempo total:", error)
    }
  }

  useEffect(() => {
    const updatedGoals = DEFAULT_GOALS.map((goal) => ({
      ...goal,
      status: totalTimeWatched / 3600 >= goal.hours ? "completed" : "pending",
    }))
    setGoals(updatedGoals)
  }, [totalTimeWatched])

  useEffect(() => {
    goals.forEach((goal) => {
      if (goal.status === "completed" && !goal.notified) {
        Alert.alert("¡Felicidades!", `Completaste: ${goal.title}`)
        goal.notified = true
      }
    })
  }, [goals])

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#4A90E2", "#5AB9EA"]} style={styles.headerGradient}>
        <Text style={styles.pageTitle}>Objetivos</Text>
        <View style={styles.totalTimeWatchedContainer}>
          <Ionicons name="time-outline" size={24} color="#FFFFFF" />
          <Text style={styles.totalTimeWatchedText}>Tiempo total: {formatTime(totalTimeWatched)}</Text>
        </View>
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {goals.map((goal, index) => (
          <View key={index} style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              {goal.status === "pending" ? (
                <Ionicons name="time-outline" size={24} color="#FFA500" />
              ) : (
                <Ionicons name="checkmark-circle-outline" size={24} color="#4CAF50" />
              )}
            </View>
            <Text style={styles.goalDescription}>{goal.description}</Text>
            <View style={styles.progressContainer}>
              <Progress.Bar
                progress={Math.min(totalTimeWatched / 3600 / goal.hours, 1)}
                width={null}
                color="#4A90E2"
                unfilledColor="#E0E0E0"
                borderWidth={0}
                height={8}
                borderRadius={4}
              />
              <Text style={[styles.goalStatus, { color: goal.status === "completed" ? "#4CAF50" : "#FFA500" }]}>
                {goal.status === "pending" ? "Pendiente" : "Completado"}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  totalTimeWatchedContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  totalTimeWatchedText: {
    fontSize: 16,
    color: "#FFFFFF",
    marginLeft: 8,
  },
  scrollView: {
    padding: 20,
  },
  goalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  goalDescription: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 12,
  },
  progressContainer: {
    marginTop: 8,
  },
  goalStatus: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 4,
    textAlign: "right",
  },
})

