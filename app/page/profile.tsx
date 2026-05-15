import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { supabase } from "../services/api";

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");

  // SAVED DATA
  const [savedName, setSavedName] = useState("");
  const [savedPhoto, setSavedPhoto] =
    useState<string | null>(null);

  // EDIT DATA
  const [fullName, setFullName] = useState("");
  const [photo, setPhoto] =
    useState<string | null>(null);

  // MODAL
  const [showModal, setShowModal] =
    useState(false);

  const [modalTitle, setModalTitle] =
    useState("");

  const [modalMessage, setModalMessage] =
    useState("");

  const [isSuccess, setIsSuccess] =
    useState(false);

  const [onModalPress, setOnModalPress] =
    useState<(() => void) | null>(null);

  useEffect(() => {
    getProfile();
  }, []);

  const showAlert = (
    title: string,
    message: string,
    success: boolean,
    action?: () => void
  ) => {
    setModalTitle(title);
    setModalMessage(message);
    setIsSuccess(success);
    setShowModal(true);
    setOnModalPress(() => action || null);
  };

  const getProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/page/login");
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.log(error);
        return;
      }

      setEmail(data?.email || "");

      setSavedName(data?.full_name || "");
      setFullName(data?.full_name || "");

      setSavedPhoto(data?.photo || null);
      setPhoto(data?.photo || null);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    const hasChanges =
      fullName !== savedName ||
      photo !== savedPhoto;

    if (hasChanges) {
      showAlert(
        "Discard Changes?",
        "You have unsaved changes.",
        false,
        () => router.back()
      );

      return;
    }

    router.back();
  };

  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        showAlert(
          "Permission Needed",
          "Please allow gallery access",
          false
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync(
          {
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          }
        );

      if (result.canceled) return;

      const image = result.assets[0];

      setPhoto(image.uri);

      showAlert(
        "Photo Selected",
        "Press Save Profile to save your new photo.",
        true
      );
    } catch (error) {
      console.log(error);
    }
  };

  const saveProfile = async () => {
    try {
      setUploading(true);

      let finalPhoto = savedPhoto;

      // UPLOAD FOTO BARU
      if (photo && photo !== savedPhoto) {
        const response = await fetch(photo);

        const arrayBuffer =
          await response.arrayBuffer();

        const fileExt = photo
          .split(".")
          .pop();

        const fileName = `${Date.now()}.${fileExt}`;

        const filePath = `photos/${fileName}`;

        const { error: uploadError } =
          await supabase.storage
            .from("photos")
            .upload(
              filePath,
              arrayBuffer,
              {
                contentType:
                  "image/jpeg",
              }
            );

        if (uploadError) {
          showAlert(
            "Upload Failed",
            uploadError.message,
            false
          );

          return;
        }

        const { data } =
          supabase.storage
            .from("photos")
            .getPublicUrl(filePath);

        finalPhoto = data.publicUrl;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          photo: finalPhoto,
        })
        .eq("id", userId);

      if (error) {
        showAlert(
          "Update Failed",
          error.message,
          false
        );

        return;
      }

      setSavedName(fullName);
      setSavedPhoto(finalPhoto);

      setPhoto(finalPhoto);

      setIsEditing(false);

      showAlert(
        "Profile Updated",
        "Your profile has been updated successfully.",
        true
      );
    } catch (error) {
      console.log(error);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#3FA16F"
        />
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <LinearGradient
          colors={["#1F5235", "#2F6B4F"]}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons
              name="chevron-back"
              size={28}
              color="#163525"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={pickImage}
            activeOpacity={0.8}
            disabled={!isEditing}
          >
            {photo ? (
              <Image
                source={{ uri: photo }}
                style={styles.avatar}
              />
            ) : (
              <View
                style={
                  styles.defaultAvatar
                }
              >
                <Ionicons
                  name="person"
                  size={70}
                  color="#ffffff"
                />
              </View>
            )}

            {isEditing && (
              <View
                style={styles.cameraIcon}
              >
                <Ionicons
                  name="camera"
                  size={18}
                  color="#fff"
                />
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.nameText}>
            {savedName || "New User"}
          </Text>

          <Text style={styles.emailText}>
            {email}
          </Text>
        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.label}>
            Full Name
          </Text>

          <TextInput
            style={[
              styles.input,
              !isEditing &&
                styles.disabledInput,
            ]}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            placeholderTextColor="#9ca3af"
            editable={isEditing}
          />

          <Text style={styles.label}>
            Email
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.disabledInput,
            ]}
            value={email}
            editable={false}
          />

          {isEditing ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={saveProfile}
              disabled={uploading}
            >
              <LinearGradient
                colors={[
                  "#A9E5BC",
                  "#3FA16F",
                ]}
                style={styles.button}
              >
                <Text
                  style={
                    styles.buttonText
                  }
                >
                  {uploading
                    ? "Saving..."
                    : "Save Profile"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                setIsEditing(true)
              }
            >
              <LinearGradient
                colors={[
                  "#1F5235",
                  "#2F6B4F",
                ]}
                style={styles.button}
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

      <Modal
        transparent
        visible={showModal}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View
            style={styles.modalContainer}
          >
            <LinearGradient
              colors={
                isSuccess
                  ? [
                      "#75DFA8",
                      "#2F9B68",
                    ]
                  : [
                      "#FF826F",
                      "#B93224",
                    ]
              }
              style={styles.iconWrapper}
            >
              <Ionicons
                name={
                  isSuccess
                    ? "checkmark"
                    : "close"
                }
                size={34}
                color="#fff"
              />
            </LinearGradient>

            <Text
              style={styles.modalTitle}
            >
              {modalTitle}
            </Text>

            <Text
              style={styles.modalText}
            >
              {modalMessage}
            </Text>

            <TouchableOpacity
              onPress={() => {
                setShowModal(false);

                if (onModalPress) {
                  onModalPress();
                }
              }}
            >
              <LinearGradient
                colors={[
                  "#A9E5BC",
                  "#3FA16F",
                ]}
                style={
                  styles.modalButton
                }
              >
                <Text
                  style={
                    styles.buttonText
                  }
                >
                  OK
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    alignItems: "center",
    paddingTop: 70,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor:
      "rgba(255,255,255,0.75)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },

  avatar: {
    width: 140,
    height: 140,
    borderRadius: 999,
    borderWidth: 4,
    borderColor: "#fff",
  },

  defaultAvatar: {
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: "#6b7280",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fff",
  },

  cameraIcon: {
    position: "absolute",
    right: 5,
    bottom: 5,
    backgroundColor: "#3FA16F",
    width: 40,
    height: 40,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },

  nameText: {
    marginTop: 15,
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },

  emailText: {
    marginTop: 6,
    color: "#d1fae5",
    fontSize: 15,
  },

  card: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
    marginTop: 10,
  },

  input: {
    width: "100%",
    height: 55,
    backgroundColor: "#f3f4f6",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#111827",
  },

  disabledInput: {
    backgroundColor: "#e5e7eb",
  },

  button: {
    marginTop: 30,
    height: 55,
    borderRadius: 999,
    justifyContent: "center",
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
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    width: 350,
    backgroundColor: "#296048",
    borderRadius: 24,
    paddingVertical: 30,
    paddingHorizontal: 24,
    alignItems: "center",
  },

  iconWrapper: {
    width: 75,
    height: 75,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },

  modalText: {
    fontSize: 14,
    color: "#d4ede0",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },

  modalButton: {
    width: 130,
    height: 45,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
});