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
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../services/api";

const { width } = Dimensions.get("window");

type Role = "user" | "admin";

const ROLES: {
  label: string;
  value: Role;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { label: "User", value: "user", icon: "person-outline" },
  { label: "Admin", value: "admin", icon: "shield-checkmark-outline" },
];

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [focused, setFocused] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRegister = async () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim() ||
      !role
    ) {
      setModalTitle("Registration Failed");
      setModalMessage("Please fill in all fields.");
      setIsSuccess(false);
      setShowModal(true);
      return;
    }

    if (password !== confirmPassword) {
      setModalTitle("Registration Failed");
      setModalMessage("Passwords do not match.");
      setIsSuccess(false);
      setShowModal(true);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error || !data.user) {
      setModalTitle("Registration Failed");
      setModalMessage(error?.message || "Something went wrong");
      setIsSuccess(false);
      setShowModal(true);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      name,
      role,
      email,
    });

    if (profileError) {
      setModalTitle("Registration Failed");
      setModalMessage(profileError.message);
      setIsSuccess(false);
      setShowModal(true);
      return;
    }

    setModalTitle("Registration Successful");
    setModalMessage("Your account has been created successfully.");
    setIsSuccess(true);
    setShowModal(true);

    setTimeout(() => {
      router.replace("/page/login");
    }, 1800);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={true}
        bounces={false}
        overScrollMode="never"
      >
        <View style={styles.circleLeft} />
        <View style={styles.circleRight} />
        <View style={styles.circleBottomLeft} />
        <View style={styles.circleBottomRight} />

        <View style={styles.center}>
          <Text style={styles.logo}>GatherHub</Text>

          <View style={styles.card}>
            <Text style={styles.title}>SIGN UP</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Enter Your Name</Text>
              <TextInput
                style={[
                  styles.input,
                  focused === "name" && styles.inputFocused,
                ]}
                placeholder="Name....."
                placeholderTextColor="#aac4b4"
                value={name}
                onChangeText={setName}
                onFocus={() => setFocused("name")}
                onBlur={() => setFocused(null)}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Enter Your Email</Text>
              <TextInput
                style={[
                  styles.input,
                  focused === "email" && styles.inputFocused,
                ]}
                placeholder="Email....."
                placeholderTextColor="#aac4b4"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Enter Your Password</Text>
              <TextInput
                style={[
                  styles.input,
                  focused === "password" && styles.inputFocused,
                ]}
                placeholder="Password....."
                placeholderTextColor="#aac4b4"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirm Your Password</Text>
              <TextInput
                style={[
                  styles.input,
                  focused === "confirm" && styles.inputFocused,
                ]}
                placeholder="Password....."
                placeholderTextColor="#aac4b4"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => setFocused("confirm")}
                onBlur={() => setFocused(null)}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Choose Your Role</Text>

              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setDropdownOpen(!dropdownOpen)}
                activeOpacity={0.85}
              >
                <View style={styles.dropdownInner}>
                  {role ? (
                    <>
                      <Text style={styles.dropdownSelected}>
                        {role.toUpperCase()}
                      </Text>

                      <Ionicons
                        name={
                          role === "user"
                            ? "person-outline"
                            : "shield-checkmark-outline"
                        }
                        size={14}
                        color="#2d5a3d"
                        style={{ marginLeft: 6 }}
                      />
                    </>
                  ) : (
                    <Text style={styles.dropdownPlaceholder}>Role.....</Text>
                  )}
                </View>

                <Ionicons
                  name={dropdownOpen ? "chevron-up" : "chevron-down"}
                  size={14}
                  color="#2d5a3d"
                />
              </TouchableOpacity>

              {dropdownOpen && (
                <View style={styles.dropdownMenu}>
                  {ROLES.map((r) => (
                    <TouchableOpacity
                      key={r.value}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setRole(r.value);
                        setDropdownOpen(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{r.label}</Text>

                      <Ionicons name={r.icon} size={14} color="#555" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <TouchableOpacity onPress={handleRegister} activeOpacity={0.8}>
              <LinearGradient
                colors={["#A9E5BC", "#3FA16F"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.registerButton}
              >
                <Text style={styles.registerButtonText}>Register</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.signinRow}>
              <Text style={styles.signinText}>already have an account? </Text>

              <Pressable onPress={() => router.push("/page/login")}>
                <Text style={styles.signinLink}>SIGN IN</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal transparent visible={showModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={
                isSuccess ? ["#75DFA8", "#2F9B68"] : ["#FF826F", "#B93224"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconWrapper}
            >
              <Ionicons
                name={isSuccess ? "checkmark" : "close"}
                size={34}
                color="#fff"
              />
            </LinearGradient>

            <Text style={styles.modalTitle}>{modalTitle}</Text>

            <Text style={styles.modalText}>{modalMessage}</Text>

            <TouchableOpacity
              onPress={() => setShowModal(false)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#A9E5BC", "#3FA16F"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>OK</Text>
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

  scrollView: {
    flex: 1,
    backgroundColor: "#2F6B4F",
  },

  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#2F6B4F",
    minHeight: "100%",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100%",
    paddingVertical: 40,
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
    bottom: -20,
    left: -50,
    opacity: 0.75,
  },

  circleBottomRight: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: "#49BA8B",
    bottom: 0,
    right: -40,
    opacity: 0.8,
  },

  logo: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 19,
    marginTop: 8,
    zIndex: 10,
  },

  card: {
    width: width * 0.4,
    backgroundColor: "#216D42",
    borderRadius: 12,
    paddingVertical: 24,
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
    marginBottom: 18,
  },

  fieldGroup: {
    width: "100%",
    marginBottom: 12,
    zIndex: 1,
  },

  label: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#d4ede0",
    marginBottom: 4,
  },

  input: {
    width: "100%",
    height: 36,
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

  dropdown: {
    width: "100%",
    height: 36,
    backgroundColor: "#ffffff",
    borderRadius: 6,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dropdownInner: {
    flexDirection: "row",
    alignItems: "center",
  },

  dropdownPlaceholder: {
    fontSize: 13,
    color: "#aac4b4",
  },

  dropdownSelected: {
    fontSize: 13,
    color: "#2d5a3d",
    fontWeight: "600",
  },

  dropdownMenu: {
    position: "absolute",
    top: 58,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    borderRadius: 6,
    zIndex: 999,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: "hidden",
  },

  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  dropdownItemText: {
    fontSize: 13,
    color: "#333",
  },

  registerButton: {
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

  registerButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  signinRow: {
    flexDirection: "row",
    marginTop: 14,
    alignItems: "center",
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
