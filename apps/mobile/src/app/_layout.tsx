import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LoadingState } from "@/components/ui";
import { AuthProvider } from "@/contexts/auth";
import { EmpireProvider,useEmpire } from "@/contexts/empire";
import { EmpireThemeProvider,useEmpireTheme } from "@/contexts/theme";
SplashScreen.preventAutoHideAsync();
export default function RootLayout(){return <GestureHandlerRootView style={{flex:1}}><AuthProvider><EmpireProvider><EmpireThemeProvider><AppNavigator/></EmpireThemeProvider></EmpireProvider></AuthProvider></GestureHandlerRootView>}
function AppNavigator(){const {loading}=useEmpire();const {resolvedMode,colors}=useEmpireTheme();useEffect(()=>{if(!loading)void SplashScreen.hideAsync()},[loading]);if(loading)return <View style={{flex:1,backgroundColor:colors.background}}><LoadingState label="Web Empire"/></View>;return <><StatusBar style={resolvedMode==="dark"?"light":"dark"}/><Stack screenOptions={{headerStyle:{backgroundColor:colors.surface},headerTintColor:colors.text,contentStyle:{backgroundColor:colors.background},headerShadowVisible:false}}><Stack.Screen name="(tabs)" options={{headerShown:false}}/><Stack.Screen name="tool/[slug]" options={{title:"Web Empire"}}/><Stack.Screen name="pricing" options={{title:"Plans"}}/><Stack.Screen name="sign-in" options={{title:"Account",presentation:"modal"}}/></Stack></>}
