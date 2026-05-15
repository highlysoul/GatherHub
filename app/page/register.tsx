import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../services/api";

const { width, height } =
  Dimensions.get("window");

const DEFAULT_ROLE = "user";

export default function Register() {
  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [focused, setFocused] =
    useState<string | null>(null);

  const [showModal, setShowModal] =
    useState(false);

  const [modalTitle, setModalTitle] =
    useState("");

  const [modalMessage, setModalMessage] =
    useState("");

  const [isSuccess, setIsSuccess] =
    useState(false);

  const handleRegister = async () => {
    const trimmedName = name.trim();

    const trimmedEmail =
      email.trim();

    if (
      !trimmedName ||
      !trimmedEmail ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setModalTitle(
        "Registration Failed"
      );

      setModalMessage(
        "Please fill in all fields."
      );

      setIsSuccess(false);
      setShowModal(true);
      return;
    }

    if (
      password !== confirmPassword
    ) {
      setModalTitle(
        "Registration Failed"
      );

      setModalMessage(
        "Passwords do not match."
      );

      setIsSuccess(false);
      setShowModal(true);
      return;
    }

    const { data, error } =
      await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name:
              trimmedName,
            role: DEFAULT_ROLE,
          },
        },
      });

    if (error || !data.user) {
      setModalTitle(
        "Registration Failed"
      );

      setModalMessage(
        error?.message ||
          "Something went wrong"
      );

      setIsSuccess(false);
      setShowModal(true);
      return;
    }

    const profileData = {
      id: data.user.id,
      email: trimmedEmail,
      role: DEFAULT_ROLE,
      full_name: trimmedName,
      photo: null,
    };

    const {
      error: profileError,
    } = await supabase
      .from("profiles")
      .upsert(profileData, {
        onConflict: "id",
      });

    if (profileError) {
      setModalTitle(
        "Registration Failed"
      );

      setModalMessage(
        profileError.message
      );

      setIsSuccess(false);
      setShowModal(true);
      return;
    }

    setModalTitle(
      "Registration Successful"
    );

    setModalMessage(
      "Your account has been created successfully."
    );

    setIsSuccess(true);
    setShowModal(true);

    setTimeout(() => {
      router.replace(
        "/page/login"
      );
    }, 1800);
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <KeyboardAvoidingView
        style={styles.root}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.scrollContainer
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
        >
          <View
            style={styles.circleLeft}
          />

          <View
            style={styles.circleRight}
          />

          <View
            style={
              styles.circleBottomLeft
            }
          />

          <View
            style={
              styles.circleBottomRight
            }
          />

          <View style={styles.center}>
            <Text style={styles.logo}>
              GatherHub
            </Text>

            <View style={styles.card}>
              <Text
                style={styles.title}
              >
                SIGN UP
              </Text>

              <View
                style={
                  styles.fieldGroup
                }
              >
                <Text
                  style={styles.label}
                >
                  Enter Your Name
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    focused ===
                      "name" &&
                      styles.inputFocused,
                  ]}
                  placeholder="Name....."
                  placeholderTextColor="#aac4b4"
                  value={name}
                  onChangeText={setName}
                  onFocus={() =>
                    setFocused(
                      "name"
                    )
                  }
                  onBlur={() =>
                    setFocused(
                      null
                    )
                  }
                />
              </View>

              <View
                style={
                  styles.fieldGroup
                }
              >
                <Text
                  style={styles.label}
                >
                  Enter Your Email
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    focused ===
                      "email" &&
                      styles.inputFocused,
                  ]}
                  placeholder="Email....."
                  placeholderTextColor="#aac4b4"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() =>
                    setFocused(
                      "email"
                    )
                  }
                  onBlur={() =>
                    setFocused(
                      null
                    )
                  }
                />
              </View>

              <View
                style={
                  styles.fieldGroup
                }
              >
                <Text
                  style={styles.label}
                >
                  Enter Your Password
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    focused ===
                      "password" &&
                      styles.inputFocused,
                  ]}
                  placeholder="Password....."
                  placeholderTextColor="#aac4b4"
                  secureTextEntry
                  value={password}
                  onChangeText={
                    setPassword
                  }
                  onFocus={() =>
                    setFocused(
                      "password"
                    )
                  }
                  onBlur={() =>
                    setFocused(
                      null
                    )
                  }
                />
              </View>

              <View
                style={
                  styles.fieldGroup
                }
              >
                <Text
                  style={styles.label}
                >
                  Confirm Your Password
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    focused ===
                      "confirm" &&
                      styles.inputFocused,
                  ]}
                  placeholder="Password....."
                  placeholderTextColor="#aac4b4"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={
                    setConfirmPassword
                  }
                  onFocus={() =>
                    setFocused(
                      "confirm"
                    )
                  }
                  onBlur={() =>
                    setFocused(
                      null
                    )
                  }
                />
              </View>

              <TouchableOpacity
                onPress={
                  handleRegister
                }
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[
                    "#A9E5BC",
                    "#3FA16F",
                  ]}
                  start={{
                    x: 0,
                    y: 0,
                  }}
                  end={{
                    x: 1,
                    y: 1,
                  }}
                  style={
                    styles.registerButton
                  }
                >
                  <Text
                    style={
                      styles.registerButtonText
                    }
                  >
                    Register
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <View
                style={
                  styles.signinRow
                }
              >
                <Text
                  style={
                    styles.signinText
                  }
                >
                  already have an
                  account?{" "}
                </Text>

                <Pressable
                  onPress={() =>
                    router.push(
                      "/page/login"
                    )
                  }
                >
                  <Text
                    style={
                      styles.signinLink
                    }
                  >
                    SIGN IN
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>

        <Modal
          transparent
          visible={showModal}
          animationType="fade"
        >
          <View
            style={
              styles.modalOverlay
            }
          >
            <View
              style={
                styles.modalContainer
              }
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
                start={{
                  x: 0,
                  y: 0,
                }}
                end={{
                  x: 1,
                  y: 1,
                }}
                style={
                  styles.iconWrapper
                }
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
                style={
                  styles.modalTitle
                }
              >
                {modalTitle}
              </Text>

              <Text
                style={
                  styles.modalText
                }
              >
                {modalMessage}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setShowModal(false)
                }
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[
                    "#A9E5BC",
                    "#3FA16F",
                  ]}
                  start={{
                    x: 0,
                    y: 0,
                  }}
                  end={{
                    x: 1,
                    y: 1,
                  }}
                  style={
                    styles.modalButton
                  }
                >
                  <Text
                    style={
                      styles.modalButtonText
                    }
                  >
                    OK
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        "#2F6B4F",
    },

    root: {
      flex: 1,
      backgroundColor:
        "#2F6B4F",
    },

    scrollContainer: {
      minHeight: height,
      justifyContent:
        "center",
      paddingVertical: 30,
      paddingHorizontal: 20,
    },

    center: {
      alignItems: "center",
      justifyContent:
        "center",
    },

    circleLeft: {
      position: "absolute",
      width: width * 0.9,
      height: width * 0.9,
      borderRadius: 999,
      backgroundColor:
        "#1F5235",
      top: -120,
      left: -120,
    },

    circleRight: {
      position: "absolute",
      width: width * 0.8,
      height: width * 0.8,
      borderRadius: 999,
      backgroundColor:
        "#E37059",
      top: -100,
      right: -100,
    },

    circleBottomLeft: {
      position: "absolute",
      width: 220,
      height: 220,
      borderRadius: 999,
      backgroundColor:
        "#A9C9A0",
      bottom: -60,
      left: -60,
      opacity: 0.75,
    },

    circleBottomRight: {
      position: "absolute",
      width: 180,
      height: 180,
      borderRadius: 999,
      backgroundColor:
        "#49BA8B",
      bottom: -40,
      right: -40,
      opacity: 0.8,
    },

    logo: {
      fontSize:
        width < 380
          ? 34
          : 42,
      fontWeight: "bold",
      color: "#fff",
      marginBottom: 24,
      zIndex: 10,
    },

    card: {
      width: "100%",
      maxWidth: 420,
      backgroundColor:
        "#216D42",
      borderRadius: 20,
      paddingVertical: 28,
      paddingHorizontal: 22,
      alignItems: "center",
      zIndex: 10,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 10,
    },

    title: {
      fontSize: 20,
      fontWeight: "700",
      color: "#e8f5ee",
      letterSpacing: 3,
      marginBottom: 24,
    },

    fieldGroup: {
      width: "100%",
      marginBottom: 16,
    },

    label: {
      fontSize: 13,
      fontWeight: "bold",
      color: "#d4ede0",
      marginBottom: 7,
    },

    input: {
      width: "100%",
      height: 48,
      backgroundColor:
        "#ffffff",
      borderRadius: 10,
      paddingHorizontal: 14,
      fontSize: 14,
      color: "#2d5a3d",
      borderWidth: 2,
      borderColor:
        "transparent",
    },

    inputFocused: {
      borderColor:
        "#3db88a",
    },

    registerButton: {
      marginTop: 12,
      width:
        width < 380
          ? 220
          : 260,
      height: 48,
      borderRadius: 999,
      alignItems: "center",
      justifyContent:
        "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 7,
      elevation: 7,
    },

    registerButtonText: {
      color: "#ffffff",
      fontSize: 16,
      fontWeight: "700",
    },

    signinRow: {
      flexDirection: "row",
      marginTop: 20,
      alignItems: "center",
      flexWrap: "wrap",
      justifyContent:
        "center",
    },

    signinText: {
      fontSize: 13,
      color: "#c8e6d4",
    },

    signinLink: {
      fontSize: 13,
      fontWeight: "bold",
      color: "#ffffff",
    },

    modalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(0,0,0,0.45)",
      justifyContent:
        "center",
      alignItems: "center",
      paddingHorizontal: 20,
    },

    modalContainer: {
      width: "100%",
      maxWidth: 340,
      backgroundColor:
        "#296048",
      borderRadius: 24,
      paddingVertical: 30,
      paddingHorizontal: 24,
      alignItems: "center",
    },

    iconWrapper: {
      width: 75,
      height: 75,
      borderRadius: 999,
      justifyContent:
        "center",
      alignItems: "center",
      marginBottom: 18,
    },

    modalTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: "#fff",
      marginBottom: 10,
      textAlign: "center",
    },

    modalText: {
      fontSize: 14,
      color: "#d4ede0",
      textAlign: "center",
      marginBottom: 24,
      lineHeight: 22,
    },

    modalButton: {
      minWidth: 140,
      height: 42,
      borderRadius: 999,
      alignItems: "center",
      justifyContent:
        "center",
    },

    modalButtonText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "700",
    },
  });