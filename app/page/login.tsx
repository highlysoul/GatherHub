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
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";

const { width, height } = Dimensions.get("window");

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please fill in all fields.");
      setShowError(true);
      return;
    }

    const user = await login(email, password);

    if (!user) {
      setErrorMessage("Email or password incorrect!");
      setShowError(true);
      return;
    }

    router.replace("/page/home");
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.circleLeft} />
      <View style={styles.circleRight} />
      <View style={styles.circleBottomLeft} />
      <View style={styles.circleBottomRight} />

      <View style={styles.center}>
        <Text style={styles.logo}>GatherHub</Text>

        <View style={styles.card}>
          <Text style={styles.title}>SIGN IN</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Enter Your Email</Text>
            <TextInput
              style={[styles.input, emailFocused && styles.inputFocused]}
              placeholder="name@gmail.com"
              placeholderTextColor="#aac4b4"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Enter Your Password</Text>
            <TextInput
              style={[styles.input, passwordFocused && styles.inputFocused]}
              placeholder="Password....."
              placeholderTextColor="#aac4b4"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
          </View>

          <TouchableOpacity onPress={handleLogin} activeOpacity={0.8}>
            <LinearGradient
              colors={["#A9E5BC", "#3FA16F"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.loginButton}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>don't have an account? </Text>

            <Pressable onPress={() => router.push("/page/register")}>
              <Text style={styles.signupLink}>SIGN UP</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <Modal transparent visible={showError} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={["#FF826F", "#B93224"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconWrapper}
            >
              <Ionicons name="close" size={34} color="#fff" />
            </LinearGradient>

            <Text style={styles.modalTitle}>Login Failed</Text>

            <Text style={styles.modalText}>{errorMessage}</Text>

            <TouchableOpacity
              onPress={() => setShowError(false)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#A9E5BC", "#3FA16F"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Try Again</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#2F6B4F",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  circleLeft: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: 300,
    backgroundColor: "#1F5235",
    top: -80,
    left: -80,
  },

  circleRight: {
    position: "absolute",
    width: 330,
    height: 350,
    borderRadius: 240,
    backgroundColor: "#E37059",
    top: -80,
    right: -80,
  },

  circleBottomLeft: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "#A9C9A0",
    bottom: -50,
    left: -50,
    opacity: 0.75,
  },

  circleBottomRight: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: "#49BA8B",
    bottom: -30,
    right: -40,
    opacity: 0.8,
  },

  logo: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    zIndex: 10,
  },

  card: {
    width: width * 0.4,
    backgroundColor: "#216D42",
    borderRadius: 12,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e8f5ee",
    letterSpacing: 3,
    marginBottom: 20,
  },

  fieldGroup: {
    width: "100%",
    marginBottom: 14,
  },

  label: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#d4ede0",
    marginBottom: 5,
  },

  input: {
    width: "100%",
    height: 38,
    backgroundColor: "#ffffff",
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 13,
    color: "#2d5a3d",
    borderWidth: 2,
    borderColor: "transparent",
  },

  inputFocused: {
    borderColor: "#3db88a",
  },

  loginButton: {
    marginTop: 6,
    width: 168,
    minWidth: 168,
    height: 38,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 7,
    elevation: 7,
  },

  loginButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  signupRow: {
    flexDirection: "row",
    marginTop: 16,
    alignItems: "center",
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
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    width: 450,
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
    minWidth: 132,
    height: 38,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 7,
    elevation: 7,
  },

  modalButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
