// app/_layout.tsx
import { Stack } from "expo-router";


export default function CustomerLayout() {
  
  return (
    <Stack>

      <Stack.Screen name="home" 
        
        options={{
            headerShown: false,
            title: "Home"
        }}
      />     
      <Stack.Screen 
        name="tracking"
        options={{
          title: "Tracking Status"
        }} 
      />
      <Stack.Screen 
        name="progress"
        options={{
          title: "Work Progress"
        }} 
      />
      <Stack.Screen 
        name="profile"
        options={{
          title: "Profile",
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="reportIssue"
        options={{
          title: "Report Issue",
        }} 
      />
    </Stack>
  );
}