import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PaymentSuccess() {
  const params = useLocalSearchParams();
  const amount = params.amount || 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconWrapper}>
          <LinearGradient
            colors={["#A9E5BC", "#3FA16F"]}
            style={styles.iconCircle}
          >
            <Ionicons name="checkmark" size={64} color="#fff" />
          </LinearGradient>
        </View>

        {/* Title */}
        <Text style={styles.title}>Payment Successful</Text>

        {/* Amount */}
        <Text style={styles.amount}>${amount}</Text>

        {/* Description */}
        <Text style={styles.description}>
          Your ticket has been successfully issued and is now available in My
          Tickets.
        </Text>

        {/* View My Tickets */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.replace("/page/viewTickets" as any)}
        >
          <LinearGradient
            colors={["#A9E5BC", "#3FA16F"]}
            style={styles.primaryButton}
          >
            <Ionicons
              name="ticket-outline"
              size={18}
              color="#fff"
              style={{
                marginRight: 8,
              }}
            />

            <Text style={styles.primaryButtonText}>View My Tickets</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Back to Home */}
        <TouchableOpacity onPress={() => router.replace("/page/home" as any)}>
          <Text style={styles.backText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2F6B4F",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  content: {
    width: "100%",
    alignItems: "center",
  },

  iconWrapper: {
    marginBottom: 30,
  },

  iconCircle: {
    width: 130,
    height: 130,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
    textAlign: "center",
  },

  amount: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#A9E5BC",
    marginBottom: 12,
  },

  description: {
    fontSize: 15,
    color: "#D1FAE5",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 36,
    paddingHorizontal: 12,
  },

  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 34,
    borderRadius: 999,
    minWidth: 240,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  backText: {
    marginTop: 22,
    fontSize: 14,
    color: "#D1FAE5",
    textDecorationLine: "underline",
  },
});
