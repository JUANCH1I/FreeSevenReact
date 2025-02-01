// src/services/firebase.js
import { initializeApp } from 'firebase/app'
import { doc, getFirestore, runTransaction } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyBSl6srh8YIGsrTPhNuFUJlB7FDkS98Lik',
  authDomain: 'freeseven-fefc4.firebaseapp.com',
  projectId: 'freeseven-fefc4',
  storageBucket: 'freeseven-fefc4.firebasestorage.app',
  messagingSenderId: '603135164035',
  appId: '1:603135164035:web:b00e7fe68c74a0a4bd65b6',
  measurementId: 'G-WH06KXBZPR',
}
// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Servicios de Firebase
const db = getFirestore(app)
const storage = getStorage(app)

const incrementLikes = async (campaignId) => {
  const statsRef = doc(db, 'statistics', campaignId)

  try {
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(statsRef)

      if (!snapshot.exists()) {
        // Si no existe, crea el documento con valores iniciales
        transaction.set(statsRef, { likes: 1, clicks: 0, views: 0 })
      } else {
        // Si existe, incrementa los likes
        const data = snapshot.data() || {}
        const currentLikes = data.likes || 0
        transaction.update(statsRef, { likes: currentLikes + 1 })
      }
    })
  } catch (error) {
    console.error('Error al incrementar Me Gusta:', error)
  }
}

const incrementViews = async (campaignId) => {
  const statsRef = doc(db, 'statistics', campaignId)

  try {
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(statsRef)

      if (!snapshot.exists) {
        transaction.set(statsRef, { likes: 0, clicks: 0, views: 1 })
      } else {
        const currentViews = snapshot.data().views || 0
        transaction.update(statsRef, { views: currentViews + 1 })
      }
    })
  } catch (error) {
    console.error('Error incrementing views:', error)
  }
}

const incrementClicks = async (campaignId) => {
  const statsRef = doc(db, 'statistics', campaignId)
  console.log(campaignId)

  try {
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(statsRef)

      if (!snapshot.exists()) {
        transaction.set(statsRef, { likes: 0, clicks: 1, views: 0 })
      } else {
        const data = snapshot.data() || {}
        const currentClicks = data.clicks || 0
        transaction.update(statsRef, { clicks: currentClicks + 1 })
      }
    })
  } catch (error) {
    console.error('Error incrementando clics:', error)
  }
}

const incrementGlobalMetrics = async (campaignId, type) => {
  const campaignRef = doc(db, 'campaigns', campaignId)
  console.log('type', type)

  try {
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(campaignRef)

      if (!snapshot.exists()) {
        // Si el documento no existe, inicializa con valores predeterminados
        transaction.set(campaignRef, {
          metrics: {
            totalLikes: type === 'like' ? 1 : 0,
            totalClicks: type === 'click' ? 1 : 0,
            totalViews: type === 'view' ? 1 : 0,
          },
        })
      } else {
        const metrics = snapshot.data().metrics || {}

        // Inicializa cada métrica a 0 si no existe
        const totalLikes = metrics.totalLikes || 0
        const totalClicks = metrics.totalClicks || 0
        const totalViews = metrics.totalViews || 0

        transaction.update(campaignRef, {
          metrics: {
            totalLikes: totalLikes + (type === 'like' ? 1 : 0),
            totalClicks: totalClicks + (type === 'click' ? 1 : 0),
            totalViews: totalViews + (type === 'view' ? 1 : 0),
          },
        })

        console.log('metricas', metrics)
        console.log('totalLikes:', totalLikes)
        console.log('totalClicks:', totalClicks)
        console.log('totalViews:', totalViews)
      }
    })
  } catch (error) {
    console.error('Error incrementando métricas globales:', error)
  }
}

const updateWatchTime = async (campaignId, userId, timeWatched) => {
  console.log('updateWatchTime')
  const userCampaignRef = doc(db, `campaigns/${campaignId}/users`, userId) // Usuario en campaña
  const campaignRef = doc(db, 'campaigns', campaignId) // Métricas globales de campaña
  const userGlobalRef = doc(db, 'users', userId) // Métricas globales de usuario
  console.log('userCampaignRef', userCampaignRef)
  console.log('campaignRef', campaignRef)
  console.log('userGlobalRef', userGlobalRef)
  console.log('timeWatched', timeWatched)
  console.log('userId', userId)

  try {
    runTransaction(db, async (transaction) => {
      console.log('ejectuando runTransaction')
      // Leer todos los documentos necesarios primero
      const userCampaignSnapshot = await transaction.get(userCampaignRef)
      const campaignSnapshot = await transaction.get(campaignRef)
      const userGlobalSnapshot = await transaction.get(userGlobalRef)

      // Inicializar datos con valores predeterminados si no existen
      const userCampaignData = userCampaignSnapshot.exists()
        ? userCampaignSnapshot.data()
        : { watchTime: 0 }

      const campaignData = campaignSnapshot.exists()
        ? campaignSnapshot.data()
        : { metrics: { totalWatchTime: 0 } }

      const userGlobalData = userGlobalSnapshot.exists()
        ? userGlobalSnapshot.data()
        : { totalWatchTime: 0 }

      // Actualizar los valores
      transaction.set(
        userCampaignRef,
        {
          watchTime: (userCampaignData.watchTime || 0) + timeWatched,
        },
        { merge: true }
      )

      transaction.set(
        campaignRef,
        {
          metrics: {
            totalWatchTime:
              (campaignData.metrics?.totalWatchTime || 0) + timeWatched,
          },
        },
        { merge: true }
      )

      transaction.set(
        userGlobalRef,
        {
          totalWatchTime: (userGlobalData.totalWatchTime || 0) + timeWatched,
        },
        { merge: true }
      )
    })

    console.log(
      `Tiempo actualizado: +${timeWatched}s para campaña ${campaignId} y usuario ${userId}.`
    )
  } catch (error) {
    console.error('Error actualizando tiempo visto:', error)
  }
}

const incrementUserMetrics = async (campaignId, userId, type) => {
  const userRef = doc(db, `campaigns/${campaignId}/users`, userId)

  try {
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(userRef)

      if (!snapshot.exists()) {
        transaction.set(userRef, {
          clicks: type === 'click' ? 1 : 0,
          views: type === 'view' ? 1 : 0,
        })
      } else {
        const data = snapshot.data()
        transaction.update(userRef, {
          likes: data.likes + (type === 'like' ? 1 : 0),
          clicks: data.clicks + (type === 'click' ? 1 : 0),
          views: data.views + (type === 'view' ? 1 : 0),
        })
      }
    })
  } catch (error) {
    console.error('Error incrementando métricas por usuario:', error)
  }
}

export {
  db,
  storage,
  incrementLikes,
  incrementViews,
  incrementClicks,
  incrementGlobalMetrics,
  incrementUserMetrics,
  updateWatchTime,
}
