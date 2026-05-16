import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import React, {
  useEffect,
  useState,
} from "react";

import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "../services/api";

export default function Profile() {
  const [profile, setProfile] =
    useState<any>(null);

  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [photo, setPhoto] =
    useState("");

  const [tempPhoto, setTempPhoto] =
    useState("");

  const [tempName, setTempName] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [isEditing, setIsEditing] =
    useState(false);

  const [showImagePicker, setShowImagePicker] =
    useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile =
    async () => {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        router.replace(
          "/page/login"
        );

        return;
      }

      const { data } =
        await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

      if (data) {
        setProfile(data);

        setFullName(
          data.full_name || ""
        );

        setTempName(
          data.full_name || ""
        );

        setEmail(
          data.email || ""
        );

        setPhoto(
          data.photo || ""
        );

        setTempPhoto(
          data.photo || ""
        );
      }
    };

  const pickImage = async () => {
    const cameraPermission =
      await ImagePicker.requestCameraPermissionsAsync();

    const galleryPermission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (
      !cameraPermission.granted ||
      !galleryPermission.granted
    ) {
      Alert.alert(
        "Permission Needed",
        "Please allow camera and gallery access."
      );

      return;
    }

    setShowImagePicker(true);
  };

  const saveProfile =
    async () => {
      try {
        setLoading(true);

        const {
          data: { user },
        } =
          await supabase.auth.getUser();

        if (!user) return;

        let photoUrl = photo;

        // UPLOAD PHOTO
        if (
          tempPhoto &&
          tempPhoto !== photo
        ) {
          const fileExt =
            tempPhoto
              .split(".")
              .pop();

          const fileName = `${Date.now()}.${fileExt}`;

          const filePath = `profiles/${fileName}`;

          try {
            const response =
              await fetch(
                tempPhoto
              );

            const arrayBuffer =
              await response.arrayBuffer();

            const {
              error:
                uploadError,
            } =
              await supabase.storage
                .from("photos")
                .upload(
                  filePath,
                  arrayBuffer,
                  {
                    contentType:
                      "image/jpeg",

                    upsert: true,
                  }
                );

            if (
              uploadError
            ) {
              console.log(
                "UPLOAD ERROR:",
                uploadError
              );

              Alert.alert(
                "Upload Failed",
                uploadError.message
              );

              return;
            }

            const { data } =
              supabase.storage
                .from("photos")
                .getPublicUrl(
                  filePath
                );

            photoUrl =
              data.publicUrl;
          } catch (error) {
            console.log(
              "NETWORK ERROR:",
              error
            );

            Alert.alert(
              "Network Error",
              "Failed to upload image."
            );

            return;
          }
        }

        // UPDATE PROFILE
        const { error } =
          await supabase
            .from("profiles")
            .update({
              full_name:
                tempName,

              photo: photoUrl,
            })
            .eq("id", user.id);

        if (error) {
          console.log(error);

          Alert.alert(
            "Update Failed",
            error.message
          );

          return;
        }

        setFullName(
          tempName
        );

        setPhoto(photoUrl);

        setTempPhoto(
          photoUrl
        );

        setIsEditing(false);

        Alert.alert(
          "Success",
          "Profile updated successfully."
        );

        fetchProfile();
      } catch (error) {
        console.log(error);

        Alert.alert(
          "Error",
          "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

  const handleBack =
    () => {
      const hasChanges =
        tempName !==
          fullName ||
        tempPhoto !== photo;

      if (
        isEditing &&
        hasChanges
      ) {
        Alert.alert(
          "Discard Changes?",
          "You have unsaved changes.",
          [
            {
              text: "Cancel",
              style:
                "cancel",
            },

            {
              text:
                "Discard",

              style:
                "destructive",

              onPress:
                () => {
                  setTempName(
                    fullName
                  );

                  setTempPhoto(
                    photo
                  );

                  setIsEditing(
                    false
                  );

                  router.back();
                },
            },
          ]
        );

        return;
      }

      router.back();
    };

  return (
    <SafeAreaView
      style={styles.safe}
    >
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* HEADER */}
        <LinearGradient
          colors={[
            "#1F5235",
            "#2F6B4F",
          ]}
          style={styles.header}
        >
          <View
            style={
              styles.orangeCircle
            }
          />

          <View
            style={
              styles.greenCircle
            }
          />

          {/* BACK */}
          <TouchableOpacity
            style={
              styles.backButton
            }
            onPress={
              handleBack
            }
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color="#163525"
            />
          </TouchableOpacity>

          <Text style={styles.title}>
            My Profile
          </Text>

          {/* PHOTO */}
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={
              !isEditing
            }
            onPress={
              pickImage
            }
          >
            <Image
              source={{
                uri:
                  tempPhoto ||
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
              }}
              style={
                styles.profileImage
              }
            />

            {isEditing && (
              <View
                style={
                  styles.cameraButton
                }
              >
                <Ionicons
                  name="camera"
                  size={18}
                  color="#fff"
                />
              </View>
            )}
          </TouchableOpacity>
        </LinearGradient>

        {/* FORM */}
        <View style={styles.form}>
          {/* NAME */}
          <Text
            style={styles.label}
          >
            Full Name
          </Text>

          <TextInput
            style={styles.input}
            value={
              isEditing
                ? tempName
                : fullName
            }
            editable={
              isEditing
            }
            onChangeText={
              setTempName
            }
            placeholder="Your Name"
            placeholderTextColor="#9ca3af"
          />

          {/* EMAIL */}
          <Text
            style={styles.label}
          >
            Email
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor:
                  "#f3f4f6",
              },
            ]}
            value={email}
            editable={false}
          />

          {/* BUTTON */}
          {isEditing ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={
                saveProfile
              }
              disabled={
                loading
              }
            >
              <LinearGradient
                colors={[
                  "#A9E5BC",
                  "#3FA16F",
                ]}
                style={
                  styles.button
                }
              >
                <Text
                  style={
                    styles.buttonText
                  }
                >
                  {loading
                    ? "Saving..."
                    : "Save Profile"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                setIsEditing(
                  true
                )
              }
            >
              <LinearGradient
                colors={[
                  "#1F5235",
                  "#2F6B4F",
                ]}
                style={
                  styles.button
                }
              >
                <Text
                  style={
                    styles.buttonText
                  }
                >
                  Edit Profile
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* IMAGE PICKER MODAL */}
      <Modal
        transparent
        visible={
          showImagePicker
        }
        animationType="fade"
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.imagePickerContainer
            }
          >
            <Text
              style={
                styles.modalTitle
              }
            >
              Choose Photo
            </Text>

            {/* CAMERA */}
            <TouchableOpacity
              style={
                styles.imageOption
              }
              onPress={async () => {
                setShowImagePicker(
                  false
                );

                const result =
                  await ImagePicker.launchCameraAsync(
                    {
                      allowsEditing: true,
                      aspect: [
                        1,
                        1,
                      ],
                      quality: 0.8,
                    }
                  );

                if (
                  !result.canceled
                ) {
                  setTempPhoto(
                    result
                      .assets[0]
                      .uri
                  );

                  Alert.alert(
                    "Success",
                    "Photo taken successfully."
                  );
                }
              }}
            >
              <Ionicons
                name="camera"
                size={24}
                color="#3FA16F"
              />

              <Text
                style={
                  styles.imageText
                }
              >
                Open Camera
              </Text>
            </TouchableOpacity>

            {/* GALLERY */}
            <TouchableOpacity
              style={
                styles.imageOption
              }
              onPress={async () => {
                setShowImagePicker(
                  false
                );

                const result =
                  await ImagePicker.launchImageLibraryAsync(
                    {
                      mediaTypes:
                        ["images"],
                      allowsEditing: true,
                      aspect: [
                        1,
                        1,
                      ],
                      quality: 0.8,
                    }
                  );

                if (
                  !result.canceled
                ) {
                  setTempPhoto(
                    result
                      .assets[0]
                      .uri
                  );

                  Alert.alert(
                    "Success",
                    "Photo selected successfully."
                  );
                }
              }}
            >
              <Ionicons
                name="images"
                size={24}
                color="#3FA16F"
              />

              <Text
                style={
                  styles.imageText
                }
              >
                Open Gallery
              </Text>
            </TouchableOpacity>

            {/* CANCEL */}
            <TouchableOpacity
              style={
                styles.cancelButton
              }
              onPress={() =>
                setShowImagePicker(
                  false
                )
              }
            >
              <Text
                style={
                  styles.cancelText
                }
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor:
        "#f3f4f6",
    },

    container: {
      flex: 1,
      backgroundColor:
        "#f3f4f6",
    },

    header: {
      paddingTop: 10,
      paddingBottom: 35,
      paddingHorizontal: 20,
      backgroundColor:
        "#2F6B4F",
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
      overflow: "hidden",
      alignItems: "center",
    },

    orangeCircle: {
      position: "absolute",
      width: 220,
      height: 220,
      borderRadius: 999,
      backgroundColor:
        "#E37059",
      top: -90,
      left: -90,
    },

    greenCircle: {
      position: "absolute",
      width: 90,
      height: 90,
      borderRadius: 999,
      backgroundColor:
        "#49BA8B",
      top: 20,
      right: 20,
      opacity: 0.8,
    },

    backButton: {
      alignSelf: "flex-start",
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor:
        "rgba(255,255,255,0.75)",
      justifyContent:
        "center",
      alignItems: "center",
      marginBottom: 10,
    },

    title: {
      fontSize: 30,
      fontWeight: "bold",
      color: "#fff",
      marginBottom: 25,
    },

    profileImage: {
      width: 140,
      height: 140,
      borderRadius: 999,
      borderWidth: 5,
      borderColor: "#fff",
    },

    cameraButton: {
      position: "absolute",
      bottom: 5,
      right: 5,
      width: 38,
      height: 38,
      borderRadius: 999,
      backgroundColor:
        "#3FA16F",
      justifyContent:
        "center",
      alignItems: "center",
      borderWidth: 3,
      borderColor: "#fff",
    },

    form: {
      padding: 22,
    },

    label: {
      fontSize: 15,
      fontWeight: "700",
      color: "#374151",
      marginBottom: 8,
      marginTop: 10,
    },

    input: {
      width: "100%",
      height: 56,
      backgroundColor: "#fff",
      borderRadius: 16,
      paddingHorizontal: 16,
      fontSize: 15,
      color: "#111827",
      marginBottom: 14,
    },

    button: {
      marginTop: 28,
      height: 58,
      borderRadius: 999,
      justifyContent:
        "center",
      alignItems: "center",
    },

    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },

    modalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(0,0,0,0.45)",
      justifyContent:
        "center",
      alignItems: "center",
    },

    imagePickerContainer: {
      width: 320,
      backgroundColor:
        "#296048",
      borderRadius: 24,
      padding: 24,
    },

    modalTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: "#fff",
      textAlign: "center",
    },

    imageOption: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#fff",
      padding: 16,
      borderRadius: 16,
      marginTop: 14,
    },

    imageText: {
      marginLeft: 12,
      fontSize: 15,
      fontWeight: "600",
      color: "#1F2937",
    },

    cancelButton: {
      marginTop: 18,
      alignItems: "center",
    },

    cancelText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "bold",
    },
  });