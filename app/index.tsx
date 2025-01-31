import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  AppState,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking,
} from 'react-native'
import * as Application from 'expo-application'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  doc,
  getDoc,
  collection,
  query,
  getDocs,
  where,
  runTransaction,
  and,
} from 'firebase/firestore'
import {
  db,
  incrementGlobalMetrics,
  incrementUserMetrics,
  updateWatchTime,
} from './services/firebaseConfig'
import { useVideoPlayer, VideoView } from 'expo-video'
import { Link, useRouter } from 'expo-router'
import { useEvent, useEventListener } from 'expo'
import { AntDesign, Ionicons } from '@expo/vector-icons'
import { formatTime } from './utils/utils'

export default function Index() {
  const [isRegistered, setIsRegistered] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [timeCounter, setTimeCounter] = useState(0)
  const [totalTimeWatched, setTotalTimeWatched] = useState(0)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [syncedTimeCounter, setSyncedTimeCounter] = useState(0)
  const [videoWatchTimes, setVideoWatchTimes] = useState<{
    [key: string]: number
  }>({})
  const [isPiP, setIsPiP] = useState(false)
  const appState = useRef(AppState.currentState)
  const [currentCampaignIndex, setCurrentCampaignIndex] = useState(0)
  const androidId = Application.getAndroidId()
  const router = useRouter()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const checkRegistration = async () => {
      const isRegistered = await AsyncStorage.getItem('isRegistered')

      if (isRegistered === 'true') {
        setIsRegistered(true)
        loadCampaigns(androidId)
      } else {
        setIsRegistered(false)
        router.push('./Register')
      }
    }

    checkRegistration()
  }, [])

  const loadCampaigns = async (userId: string) => {
    try {
      const userDocRef = doc(db, 'users', userId)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        const campaignsQuery = query(
          collection(db, 'campaigns'),
          where('isActive', '==', true)
        )
        const campaignsSnapshot = await getDocs(campaignsQuery)

        const campaignsList = campaignsSnapshot.docs.map((doc) => {
          const {
            descriptionTitle,
            description,
            link,
            linkText,
            mediaUrl,
            media,
          } = doc.data()
          return {
            id: doc.id,
            descriptionTitle: descriptionTitle || '',
            description: description || '',
            link: link || '',
            linkText: linkText || '',
            mediaUrl: mediaUrl || '',
            width: media.Width || 1920, // Valor predeterminado en caso de no estar disponible
            height: media.Height || 1080,
          }
        })

        setCampaigns(campaignsList)

        // Inicializar videoWatchTimes
        const initialWatchTimes: { [key: string]: number } = {}
        campaignsList.forEach((campaign) => {
          initialWatchTimes[campaign.id] = 0
        })
        setVideoWatchTimes(initialWatchTimes)

        if (campaignsList.length > 0) {
          setVideoUrl(campaignsList[0].mediaUrl)
        }
      }
    } catch (error) {
      console.error('Error al cargar campañas:', error)
    }
  }

  const handleVideoEnd = async () => {
    await syncTimeToFirebase()
    console.log(campaigns.length)
    if (campaigns.length === 1) {
      console.log('Reproducción en bucle activada.')
      setVideoUrl(campaigns[0]?.mediaUrl || '') // Reinicia el mismo video
      player.play() // Asegúrate de iniciar la reproducción
    } else {
      const nextIndex = (currentCampaignIndex + 1) % campaigns.length
      setCurrentCampaignIndex(nextIndex)
      setVideoUrl(campaigns[nextIndex]?.mediaUrl || '')
    }

    // Restablecer hasCountedView para el nuevo video
    hasCountedView.current = false
  }

  const handlePiPStart = () => {
    console.log('PiP iniciado')
    setIsPiP(true)
  }

  const handlePiPEnd = () => {
    console.log('PiP finalizado')
    setIsPiP(false)
  }

  const startTimer = () => {
    if (!intervalRef.current && isActuallyPlaying) {
      intervalRef.current = setInterval(() => {
        setTimeCounter((prev) => prev + 1) // Contador visible
        setTotalTimeWatched((prev) => prev + 1) // Tiempo total acumulado
        setVideoWatchTimes((prev) => ({
          ...prev,
          [campaigns[currentCampaignIndex]?.id || '']:
            (prev[campaigns[currentCampaignIndex]?.id || ''] || 0) + 1,
        }))
      }, 1000)
    } else if (!isActuallyPlaying && intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  const syncTimeToFirebase = async () => {
    if (!androidId || timeCounter === 0) return

    const currentCampaignId = campaigns[currentCampaignIndex]?.id || ''
    if (!currentCampaignId) {
      console.error('No hay campaña actual para sincronizar.')
      return
    }

    try {
      // Llama a la función `updateWatchTime` para sincronizar las métricas
      await updateWatchTime(currentCampaignId, androidId, timeCounter)

      console.log(`Tiempo sincronizado: ${timeCounter}s`)

      // Mueve el contador sincronizado pero mantiene el visible
      setSyncedTimeCounter((prev) => prev + timeCounter)
    } catch (error) {
      console.error('Error sincronizando el tiempo visto:', error)
    }
  }

  useEffect(() => {
    const appStateListener = AppState.addEventListener(
      'change',
      (nextAppState) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          syncTimeToFirebase()
        }
        appState.current = nextAppState
      }
    )

    return () => appStateListener.remove()
  }, [timeCounter])

  const player = useVideoPlayer(videoUrl, (player) => {
    player.audioMixingMode = 'mixWithOthers'
    player.loop = false
    player.timeUpdateEventInterval = 1; // Intervalo de 1 segundo
    player.play()
  })

  const { isPlaying } = useEvent(player, 'playingChange', {
    isPlaying: player.playing,
  })
  const isActuallyPlaying = player.status === 'readyToPlay' && player.playing

  useEffect(() => {
    console.log('isActuallyPlaying', isActuallyPlaying)
    if (isPlaying) {
      console.log('Se está reproduciendo')
      startTimer()
    } else {
      console.log('No se está reproduciendo, intentando reproducir...')
      player.play()
    }
  }, [isPlaying])

  const hasCountedView = useRef(false)

// Modificación en el `useEffect` para el evento `timeUpdate`
useEffect(() => {
  const subscription = player.addListener('timeUpdate', async () => {
    const currentTime = player.currentTime;
    const duration = player.duration;

    // Verifica si el video ha alcanzado el 50% de su duración
    if (
      !hasCountedView.current &&
      currentTime &&
      duration &&
      currentTime / duration >= 0.5
    ) {
      const currentCampaignId = campaigns[currentCampaignIndex]?.id;

      // Verifica si esta campaña ya fue contada
      const viewedCampaigns = JSON.parse(
        (await AsyncStorage.getItem('viewedCampaigns')) || '[]'
      );

      if (!viewedCampaigns.includes(currentCampaignId)) {
        // Incrementa las vistas para la campaña actual
        incrementGlobalMetrics(currentCampaignId, 'view');
        console.log('Increment views');

        // Marca que esta campaña ya fue contada
        viewedCampaigns.push(currentCampaignId);
        await AsyncStorage.setItem(
          'viewedCampaigns',
          JSON.stringify(viewedCampaigns)
        );

        // Marca que la vista ha sido contada localmente
        hasCountedView.current = true;
      } else {
        console.log('Esta campaña ya fue contada previamente.');
      }
    }
  });
  return () => {
    subscription.remove();
  };
}, [player, campaigns, currentCampaignIndex]);



  useEventListener(player, 'statusChange', ({ status }) => {
    if (status === 'idle') {
      console.log('Video terminó, cargando siguiente...')
      handleVideoEnd()
    } else if (status === 'readyToPlay' && !player.playing) {
      console.log('Forzando reproducción...')
      player.play()
    }
  })

  /*const handleVideoPress = () => {
    router.push({
      pathname: './videoDetails',
      params: { campaignsDetails: JSON.stringify(campaignsDetails) },
    });
  };*/

  const handleVideoPress = () => {
    const currentVideo = campaigns[currentCampaignIndex]
    if (currentVideo && currentVideo.link) {
      incrementGlobalMetrics(campaigns[currentCampaignIndex].id, 'click')
      Linking.openURL(currentVideo.link).catch((err) =>
        console.error('Error al abrir la URL:', err)
      )
    } else {
      console.warn('No hay URL disponible para este video.')
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle='dark-content' hidden={true} />
      <View style={styles.container}>
        {isRegistered ? (
          <>
            <View style={styles.videoContainer}>
              <VideoView
                style={styles.video}
                player={player}
                contentFit='contain'
                nativeControls={false}
                allowsFullscreen
                allowsPictureInPicture
                startsPictureInPictureAutomatically
                onPictureInPictureStart={handlePiPStart}
                onPictureInPictureStop={handlePiPEnd}
              />
              <TouchableOpacity
                onPress={handleVideoPress}
                style={styles.touchable}
              />
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.timeCounter}>
                <Ionicons name='time-outline' size={24} color='#4A90E2' />{' '}
                {timeCounter}s
              </Text>
              <TouchableOpacity
                style={styles.goalsButton}
                onPress={() =>
                  router.push({
                    pathname: './goals',
                    params: { androidId: androidId },
                  })
                }
              >
                <Text style={styles.goalsButtonText}>Ver objetivos</Text>
                <Ionicons name='arrow-forward' size={24} color='#FFFFFF' />
              </TouchableOpacity>
            </View>
            <Text style={styles.totalTimeWatched}>
              <Text style={styles.totalTimeWatchedText}>Tiempo total</Text>
              <Ionicons name='time-outline' size={24} color='#4A90E2' />{' '}
              {formatTime(totalTimeWatched)}s
            </Text>
          </>
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
  },
  totalTimeWatched: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    position: 'absolute',
    bottom: 30,
  },
  totalTimeWatchedText: {
    color: '#4A90E2',
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  touchable: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  infoContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeCounter: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  goalsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
  },
  goalsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
})
