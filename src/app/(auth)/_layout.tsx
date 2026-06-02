import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack initialRouteName="index">

      <Stack.Screen name="index" options={{ 
          headerShown: false,
        }}/>
      <Stack.Screen name="registerTechnician" options={{ 
          headerShown: false,
        }}/>
      <Stack.Screen name="registerCustomer" options={{ 
          headerShown: false,
        }}/>
      <Stack.Screen name="verifyOtp" options={{ 
          headerShown: false,
        }}/>
        
    </Stack>
  );
}