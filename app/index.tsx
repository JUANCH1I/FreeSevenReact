import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, AppState, TouchableOpacity } from 'react-native';
import * as Application from 'expo-application';
import { doc, getDoc, collection, query, getDocs, where, runTransaction } from 'firebase/firestore';
import { db } from './services/firebaseConfig';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useRouter } from 'expo-router';

export default function Index() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [timeCounter, setTimeCounter] = useState(0);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [campaignsDetails, setCampaignsDetails] = useState({
    descriptionTitle: '',
    description: '',
    link: '',
    linkText: '',
  });
  const appState = useRef(AppState.currentState);
  const [currentCampaignIndex, setCurrentCampaignIndex] = useState(0);
  const androidId = "a1bc3c155d41ebd4";
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null); // Referencia al intervalo



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
        const campaignsList = campaignsSnapshot.docs.map(doc => doc.data());
        setCampaigns(campaignsList);
        if (campaignsList.length > 0) {
          setVideoUrl(campaignsList[0].mediaUrl);

          // Actualiza los detalles de la campaña con el primer elemento
        const { descriptionTitle, description, link, linkText } = campaignsList[0];
        setCampaignsDetails({
          descriptionTitle: descriptionTitle || '',
          description: description || '',
          link: link || '',
          linkText: linkText || '',
        });
        console.log(descriptionTitle, description, link, linkText);
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
    player.loop = true;
    player.play();
    startTimer();
  });


  const handleVideoPress = () => {
    router.push({
      pathname: './videoDetails',
      params: { 
        descriptionTitle: campaignsDetails.descriptionTitle,
        description: campaignsDetails.description,
        link: campaignsDetails.link,
        linkText: campaignsDetails.linkText,
       },
    });
  };

  return (
    <View style={styles.container}>
      {isRegistered ? (
        <>
          <Text style={styles.timeCounter}>Tiempo: {timeCounter}s</Text>
          <View style={styles.videoContainer}>
            <VideoView
              style={styles.video}
              player={player}
              contentFit='contain' // Ajusta la relación de aspecto según tus necesidades
              nativeControls={false}
              allowsFullscreen
              allowsPictureInPicture
              startsPictureInPictureAutomatically
            />
            <TouchableOpacity onPress={handleVideoPress} style={styles.touchable} />
          </View>
        </>
      ) : (
        <Text>Cargando...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9, // Ajusta la relación de aspecto según tus necesidades
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  touchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  timeCounter: {
    fontSize: 18,
    marginBottom: 10,
  },
});
