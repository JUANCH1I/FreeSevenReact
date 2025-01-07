import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, AppState, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import * as Application from 'expo-application';
import { doc, getDoc, collection, query, getDocs, where, runTransaction } from 'firebase/firestore';
import { db } from './services/firebaseConfig';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Link, useRouter } from 'expo-router';
import { useEvent, useEventListener } from 'expo';
import { Ionicons } from '@expo/vector-icons';

export default function Index() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [timeCounter, setTimeCounter] = useState(0);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [campaignsDetails, setCampaignsDetails] = useState<any[]>([]);
  const appState = useRef(AppState.currentState);
  const [currentCampaignIndex, setCurrentCampaignIndex] = useState(0);
  const androidId = "a1bc3c155d41ebd4";
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkRegistration = async () => {
      if (!androidId) {
        setIsRegistered(false);
      } else {
        setIsRegistered(true);
        console.log(androidId);
        loadCampaigns(androidId);
      }
    };

    checkRegistration();
  }, []);

  const loadCampaigns = async (userId: string) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
  
      if (userDoc.exists()) {
        const campaignsQuery = query(collection(db, 'campaigns'), where('isActive', '==', true));
        const campaignsSnapshot = await getDocs(campaignsQuery);
  
        const campaignsList = campaignsSnapshot.docs.map(doc => {
          const { descriptionTitle, description, link, linkText, mediaUrl } = doc.data();
          return {
            descriptionTitle: descriptionTitle || '',
            description: description || '',
            link: link || '',
            linkText: linkText || '',
            mediaUrl: mediaUrl || '',
          };
        });
  
        setCampaignsDetails(campaignsList);
        setCampaigns(campaignsList);
  
        if (campaignsList.length > 0) {
          setVideoUrl(campaignsList[0].mediaUrl);
        }
      }
    } catch (error) {
      console.error('Error al cargar campañas:', error);
    }
  };

  const handleVideoEnd = () => {
    const nextIndex = (currentCampaignIndex + 1) % campaigns.length;
    setCurrentCampaignIndex(nextIndex);
    setVideoUrl(campaigns[nextIndex]?.mediaUrl || '');
  };

  const startTimer = () => {
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setTimeCounter((prev) => prev + 1);
      }, 1000);
    }
  };

  const syncTimeToFirebase = async () => {
    if (!androidId || timeCounter === 0) return;

    try {
      const userRef = doc(db, 'users', androidId);
      await runTransaction(db, async (transaction) => {
        const doc = await transaction.get(userRef);
        const currentTotal = doc.data()?.totalTimeWatched || 0;
        transaction.update(userRef, {
          totalTimeWatched: currentTotal + timeCounter,
        });
      });

      setTimeCounter(0);
    } catch (error) {
      console.error('Error syncing time to Firebase:', error);
    }
  };

  useEffect(() => {
    const appStateListener = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        syncTimeToFirebase();
      }
      appState.current = nextAppState;
    });

    return () => appStateListener.remove();
  }, [timeCounter]);

  const player = useVideoPlayer(videoUrl, player => {
    player.loop = false;
    player.play();
    startTimer();
  });

  useEventListener(player, 'statusChange', ({ status, error }) => {
    if (status === 'idle'){
      handleVideoEnd();
    }
  }); 

  const handleVideoPress = () => {
    router.push({
      pathname: './videoDetails',
      params: { campaignsDetails: JSON.stringify(campaignsDetails) },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
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
              />
              <TouchableOpacity onPress={handleVideoPress} style={styles.touchable} />
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.timeCounter}>
                <Ionicons name="time-outline" size={24} color="#4A90E2" /> {timeCounter}s
              </Text>
              <TouchableOpacity style={styles.goalsButton} onPress={() => router.push('./goals')}>
                <Text style={styles.goalsButtonText}>Ver objetivos</Text>
                <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
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
});

