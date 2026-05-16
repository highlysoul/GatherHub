import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../services/api";

type MenuItem = {
  label: string;
  route: "/page/profile" | "/page/viewEvents" | "/page/viewTickets";
};

export default function Sidebar({ visible, onClose, role }: any) {
  const translateX = useRef(new Animated.Value(-320)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -320,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const menuItems: MenuItem[] =
    role === "admin"
      ? [
          { label: "View My Profile", route: "/page/profile" },
          { label: "View My Events", route: "/page/viewEvents" },
        ]
      : [
          { label: "View My Profile", route: "/page/profile" },
          { label: "View My Tickets", route: "/page/viewTickets" },
        ];

  const navigateTo = (route: MenuItem["route"]) => {
    onClose?.();
    router.push(route);
  };

  return (
    <View style={styles.overlay}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      <Animated.View
        style={[styles.sidebar, { opacity, transform: [{ translateX }] }]}
      >
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              activeOpacity={0.86}
              onPress={() => navigateTo(item.route)}
            >
              <LinearGradient
                colors={["#45B985", "#2F6EA0"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.menuBtn}
              >
                <Text style={styles.menuText}>{item.label}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={async () => {
            await supabase.auth.signOut();
            router.replace("/page/login");
          }}
          activeOpacity={0.86}
        >
          <LinearGradient
            colors={["#6B2A1C", "#351307"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoutBtn}
          >
            <Text style={styles.logoutText}>LOGOUT</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },

  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.08)",
  },

  sidebar: {
    position: "absolute",
    top: 40,
    left: 20,
    width: 250,
    backgroundColor: "#236D42",
    borderRadius: 28,
    paddingTop: 80,
    paddingHorizontal: 40,
    paddingBottom: 34,
    shadowColor: "#000",
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 20,
  },

  menuContainer: {
    gap: 14,
    marginBottom: 50,
  },

  menuBtn: {
    width: "100%",
    height: 35,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 5,
  },

  menuText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  logoutBtn: {
    width: "100%",
    height: 35,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },

  logoutText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
});
