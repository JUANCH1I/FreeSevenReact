import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native'
import { useLocalSearchParams } from 'expo-router'

export default function VideoDetails() {
  const { descriptionTitle, description, link, linkText } =
    useLocalSearchParams()
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{descriptionTitle}</Text>
      <Text style={styles.description}>{description}</Text>
      <TouchableOpacity onPress={() => Linking.openURL(link)}>
        <Text style={styles.linkText}>{linkText}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    gap: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 20,
    marginBottom: 8,
  },
  linkText: {
    fontSize: 16,
    color: 'blue',
    textDecorationLine: 'underline',
  },
})
