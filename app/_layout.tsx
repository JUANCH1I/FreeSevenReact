import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack  screenOptions={{ headerStyle: { backgroundColor: '#1E1E1E' }, headerTintColor: '#FFFFFF', headerTitle: 'FreeSeven', headerTitleAlign:'center', headerTitleStyle: { fontWeight: 'bold', fontSize: 18, }, }} />;
}
