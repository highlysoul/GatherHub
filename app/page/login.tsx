import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
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
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/api";

const { width, height } = Dimensions.get("window");

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [emailFocused, setEmailFocused] =
    useState(false);

  const [
    passwordFocused,
    setPasswordFocused,
  ] = useState(false);

  const [showModal, setShowModal] =
    useState(false);

  const [modalTitle, setModalTitle] =
    useState("");

  const [modalMessage, setModalMessage] =
    useState("");

  const [isSuccess, setIsSuccess] =
    useState(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    if (
      !email.trim() ||
      !password.trim()
    ) {
      setModalTitle("Login Failed");
      setModalMessage(
        "Please fill in all fields."
      );
      setIsSuccess(false);
      setShowModal(true);
      return;
    }

    const user = await login(
      email,
      password
    );

    if (!user) {
      setModalTitle("Login Failed");
      setModalMessage(
        "Email or password incorrect!"
      );
      setIsSuccess(false);
      setShowModal(true);
      return;
    }

    const {
      data: {
        user: currentUser,
      },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      setModalTitle("Login Failed");
      setModalMessage(
        "User not found."
      );
      setIsSuccess(false);
      setShowModal(true);
      return;
    }

    const {
      data: profileData,
      error,
    } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .single();

    if (error) {
      setModalTitle("Login Failed");
      setModalMessage(error.message);
      setIsSuccess(false);
      setShowModal(true);
      return;
    }

    setModalTitle(
      profileData?.role === "admin"
        ? "Welcome Admin"
        : "Login Successful"
    );

    setModalMessage(
      profileData?.role === "admin"
        ? `Welcome back, ${profileData?.full_name}!`
        : `Hello ${profileData?.full_name}, enjoy GatherHub!`
    );

    setIsSuccess(true);
    setShowModal(true);

    setTimeout(() => {
      router.replace("/page/home");
    }, 1800);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
            styles.scrollContent
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
                SIGN IN
              </Text>

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
                    emailFocused &&
                      styles.inputFocused,
                  ]}
                  placeholder="name@gmail.com"
                  placeholderTextColor="#aac4b4"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() =>
                    setEmailFocused(
                      true
                    )
                  }
                  onBlur={() =>
                    setEmailFocused(
                      false
                    )
                  }
                />
              </View>

              {/* PASSWORD */}
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

                <View>
                  <TextInput
                    style={[
                      styles.input,
                      passwordFocused &&
                        styles.inputFocused,
                      {
                        paddingRight: 50,
                      },
                    ]}
                    placeholder="Password....."
                    placeholderTextColor="#aac4b4"
                    secureTextEntry={
                      !showPassword
                    }
                    value={password}
                    onChangeText={
                      setPassword
                    }
                    onFocus={() =>
                      setPasswordFocused(
                        true
                      )
                    }
                    onBlur={() =>
                      setPasswordFocused(
                        false
                      )
                    }
                  />

                  <TouchableOpacity
                    onPress={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    style={{
                      position: "absolute",
                      right: 14,
                      top: 13,
                    }}
                  >
                    <Ionicons
                      name={
                        showPassword
                          ? "eye-off"
                          : "eye"
                      }
                      size={22}
                      color="#5B7C6F"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleLogin}
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
                    styles.loginButton
                  }
                >
                  <Text
                    style={
                      styles.loginButtonText
                    }
                  >
                    Login
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <View
                style={
                  styles.signupRow
                }
              >
                <Text
                  style={
                    styles.signupText
                  }
                >
                  don't have an
                  account?{" "}
                </Text>

                <Pressable
                  onPress={() =>
                    router.push(
                      "/page/register"
                    )
                  }
                >
                  <Text
                    style={
                      styles.signupLink
                    }
                  >
                    SIGN UP
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#2F6B4F",
  },

  root: {
    flex: 1,
    backgroundColor: "#2F6B4F",
  },

  scrollContent: {
    minHeight: height,
    justifyContent: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },

  center: {
    alignItems: "center",
    justifyContent: "center",
  },

  circleLeft: {
    position: "absolute",
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: 999,
    backgroundColor: "#1F5235",
    top: -120,
    left: -120,
  },

  circleRight: {
    position: "absolute",
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 999,
    backgroundColor: "#E37059",
    top: -100,
    right: -100,
  },

  circleBottomLeft: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "#A9C9A0",
    bottom: -60,
    left: -60,
    opacity: 0.75,
  },

  circleBottomRight: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: "#49BA8B",
    bottom: -40,
    right: -40,
    opacity: 0.8,
  },

  logo: {
    fontSize: width < 380 ? 34 : 42,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 24,
    zIndex: 10,
  },

  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#216D42",
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
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#2d5a3d",
    borderWidth: 2,
    borderColor: "transparent",
  },

  inputFocused: {
    borderColor: "#3db88a",
  },

  loginButton: {
    marginTop: 12,
    width: width < 380 ? 220 : 260,
    height: 48,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 7,
    elevation: 7,
  },

  loginButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },

  signupRow: {
    flexDirection: "row",
    marginTop: 20,
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  signupText: {
    fontSize: 13,
    color: "#c8e6d4",
  },

  signupLink: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#ffffff",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  modalContainer: {
    width: "100%",
    maxWidth: 340,
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
    justifyContent: "center",
  },

  modalButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});