import * as ImagePicker from "expo-image-picker";
import { supabase } from "./supabase";

export const pickAndUploadAvatar = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.7,
  });

  if (result.canceled) return null;

  const image = result.assets[0];

  const response = await fetch(image.uri);
  const arrayBuffer = await response.arrayBuffer();

  const fileName = `${Date.now()}.jpg`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(fileName, arrayBuffer, {
      contentType: "image/jpeg",
    });

  if (error) {
    console.log("UPLOAD ERROR:", error);
    return null;
  }

  const { data } = supabase.storage
    .from("avatars")
    .getPublicUrl(fileName);

  return data.publicUrl;
};