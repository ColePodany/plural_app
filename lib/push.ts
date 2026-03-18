import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { supabase } from "./supabase";

export async function registerForPush(userId: string) {
  if (!Device.isDevice) {
    console.log("Must use physical device for push notifications");
    return;
  }

  // 🔹 Ask permission
  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } =
      await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Permission not granted");
    return;
  }

  // 🔹 Get token
  const token = (await Notifications.getExpoPushTokenAsync()).data;

  console.log("PUSH TOKEN:", token);

  // 🔹 Save to Supabase
  await supabase.from("device_tokens").upsert({
    user_id: userId,
    expo_push_token: token,
  });

  // 🔹 Android channel (safe)
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }
}