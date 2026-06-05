// app/_layout.tsx
import { Stack } from "expo-router";


export default function TechnicianLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Dashboard" }} />
      <Stack.Screen name="taskDetail" options={{ title: "Task Overview" }} />     
      <Stack.Screen name="proofOfWork" options={{ title: "Proof of Work" }} />
      <Stack.Screen name="profile" options={{ title: "Your Profile" }} />     
      <Stack.Screen name="completedTasks" options={{ title: "Completed Tasks" }} />
    </Stack>
  );
}