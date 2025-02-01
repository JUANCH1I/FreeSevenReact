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
  where,
  onSnapshot,
} from 'firebase/firestore'
import {
  db,
  incrementGlobalMetrics,
  incrementUserMetrics,
  updateWatchTime,
} from './services/firebaseConfig'
import { isPictureInPictureSupported, useVideoPlayer, VideoView } from 'expo-video'
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
  const appState = useRef(AppState.currentState)
  const [currentCampaignIndex, setCurrentCampaignIndex] = useState(0)
  const androidId = Application.getAndroidId()
  const router = useRouter()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const player = useVideoPlayer('', (player) => {
    player.audioMixingMode = 'mixWithOthers';
    player.loop = false;
    player.timeUpdateEventInterval = 1;
  });

  const { isPlaying } = useEvent(player, 'playingChange', {
    isPlaying: player.playing,
  })
  

  useEffect(() => {
    const checkRegistration = async () => {
      const isRegistered = await AsyncStorage.getItem('isRegistered')

      if (isRegistered === 'true') {
        setIsRegistered(true)
        const unsubscribe = loadCampaigns(androidId) // Llamamos a la función de escucha en tiempo real
        await startTimer()
        return () => unsubscribe && unsubscribe() // Limpieza cuando el componente se desmonte
      } else {
        setIsRegistered(false)
        router.push('./Register')
      }
    }

    checkRegistration()
  }, [])


  const loadCampaigns = (userId: string) => {
    let unsubscribe: (() => void) | null = null

    try {
      const userDocRef = doc(db, 'users', userId)

      getDoc(userDocRef).then((userDoc) => {
        if (userDoc.exists()) {
          const campaignsQuery = query(
            collection(db, 'campaigns'),
            where('isActive', '==', true)
          )

          // Suscripción a los cambios en la colección "campaigns"
          unsubscribe = onSnapshot(campaignsQuery, (campaignsSnapshot) => {
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
                width: media?.Width || 1920, // Validación para evitar errores si media es undefined
                height: media?.Height || 1080,
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
          })
        }
      })
    } catch (error) {
      console.error('Error al cargar campañas:', error)
    }

    // Devuelve la función de limpieza
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }


  const handleVideoEnd = async () => {
    console.log('Video terminado');
    await syncTimeToFirebase();

  
    if (campaigns.length > 0) {
      const nextIndex = (currentCampaignIndex + 1) % campaigns.length;
      setCurrentCampaignIndex(nextIndex);
    }
  
    hasCountedView.current = false;
  };
  

  useEffect(() => {
    if (campaigns.length > 0) {
      const newVideoUrl = campaigns[currentCampaignIndex]?.mediaUrl || '';
      setVideoUrl(newVideoUrl);
    }
  }, [currentCampaignIndex, campaigns]);


  const startTimer = async () => {
      intervalRef.current = setInterval(() => {
        setTimeCounter((prev) => prev + 1); // Contador visible
        setTotalTimeWatched((prev) => prev + 1) // Tiempo total acumulado
        setVideoWatchTimes((prev) => ({
          ...prev,
          [campaigns[currentCampaignIndex]?.id || '']:
            (prev[campaigns[currentCampaignIndex]?.id || ''] || 0) + 1,
        }))
      }, 1000)
    
  }

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('Temporizador detenido');
    }
  };

  useEffect(() => {
    console.log('timer', timeCounter);
  }, [timeCounter]);


  const syncTimeToFirebase = async () => {

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
    if (campaigns.length > 0 && videoUrl) {
      player.replace(videoUrl);
    }
  }, [videoUrl ]);
  const isActuallyPlaying = player.status === 'readyToPlay' && player.playing



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
        }
      }
    });
    return () => {
      subscription.remove();
    };
  }, [player, campaigns, currentCampaignIndex]);



  useEventListener(player, 'statusChange', ({ status }) => {
    if (status === 'idle') {
      handleVideoEnd();
    } else if (status === 'readyToPlay' && !player.playing) {
      player.play();
    }
  });
  

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
                allowsPictureInPicture={ isPictureInPictureSupported()}
                startsPictureInPictureAutomatically={ isPictureInPictureSupported()}
              />
              <TouchableOpacity
                onPress={handleVideoPress}
                style={styles.touchable}
              />
            </View>
            <View style={styles.infoContainer}>
              
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
              {formatTime(totalTimeWatched)}
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
