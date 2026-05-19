import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Landing() {
  return (
    <SafeAreaView style={styles.safe}>
      {/* DECORATIVE CIRCLES */}
      <View style={styles.circleCoral} />
      <View style={styles.circleTopRight} />
      <View style={styles.circleBottomRight} />
      <View style={styles.circleTeal} />

      {/* CONTENT */}
      <View style={styles.content}>
        <Text style={styles.title}>GatherHub</Text>

        <Text style={styles.subtitle}>
          Find Events &{"\n"}Schedule Planning
        </Text>

        <Text style={styles.description}>
          Discover and manage events in one place.{"\n"}
          Buy tickets, track schedules, and stay updated.
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/page/login")}
        >
          <LinearGradient
            colors={["#A9E5BC", "#3FA16F"]}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Get Started →</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#2F6B4F",
  },

  circleCoral: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: "#E37059",
    bottom: -60,
    left: -80,
  },

  circleTopRight: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: "#49BA8B",
    top: -60,
    right: -40,
    opacity: 0.5,
  },

  circleBottomRight: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 999,
    backgroundColor: "#A8D5B5",
    bottom: 80,
    right: 20,
    opacity: 0.4,
  },

  circleTeal: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 999,
    backgroundColor: "#5ECFCF",
    top: 160,
    left: 20,
    opacity: 0.7,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 36,
  },

  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },

  subtitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    lineHeight: 32,
  },

  description: {
    fontSize: 14,
    color: "#D1FAE5",
    lineHeight: 22,
    marginBottom: 40,
  },

  button: {
    alignSelf: "flex-start",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 999,
  },

  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});