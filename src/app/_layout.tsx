// app/_layout.tsx
import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';



export default function RootLayout() {
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(technician)" />
      <Stack.Screen name="(customer)" />      
    </Stack>
  );
}