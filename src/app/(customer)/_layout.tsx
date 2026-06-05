// app/_layout.tsx
import { Stack } from "expo-router";


export default function CustomerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" options={{ title: "Home" }} />     
      <Stack.Screen name="tracking" options={{ title: "Tracking Status" }} />
      <Stack.Screen name="progress" options={{ title: "Work Progress" }} />
      <Stack.Screen name="profile" options={{ title: "Profile" }} />
      <Stack.Screen name="reportIssue" options={{ title: "Report Issue" }} />
      <Stack.Screen name="reportedTickets" options={{ title: "Reported Tickets" }} />
    </Stack>
  );
}