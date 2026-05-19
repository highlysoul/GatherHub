import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../services/api";

type PaymentMethod = "qris" | "card" | "cash";

export default function Payment() {
  const params = useLocalSearchParams();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("qris");

  const [showCustomAlert, setShowCustomAlert] = useState(false);

  const [alertTitle, setAlertTitle] = useState("");

  const [alertMessage, setAlertMessage] = useState("");

  const price = Number(params.price || 0);

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setShowCustomAlert(true);
  };

  const handleContinue = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        showAlert("Login Required", "Please login first.");
        return;
      }

      const { data: existingTickets, error } = await supabase
        .from("tickets")
        .select("id")
        .eq("user_id", user.id)
        .eq("event_id", Number(params.eventId))
        .neq("status", "cancelled");

      if (error) {
        console.log("Check ticket error:", error);

        showAlert("Error", "Failed to check existing ticket.");
        return;
      }

      if (existingTickets && existingTickets.length > 0) {
        showAlert(
          "Ticket Already Purchased",
          "You have already purchased a ticket for this event.",
        );
        return;
      }

      router.push({
        pathname: "/page/qrisPayment",
        params: {
          ...params,
          paymentMethod: selectedMethod,
        },
      });
    } catch (error: any) {
      console.log(error);

      showAlert("Error", error.message || "Something went wrong.");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Checkout</Text>

        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ORDER SUMMARY */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          <View style={styles.eventRow}>
            <Image
              source={{
                uri: params.eventImage as string,
              }}
              style={styles.eventImage}
            />

            <View
              style={{
                flex: 1,
                marginLeft: 14,
              }}
            >
              <Text style={styles.eventName} numberOfLines={2}>
                {params.eventName}
              </Text>

              <View style={styles.eventMeta}>
                <Ionicons name="calendar-outline" size={12} color="#6B7280" />
                <Text style={styles.eventMetaText}>
                  {params.eventDate}
                  {"  •  "}
                  {params.eventTime}
                </Text>
              </View>

              <View style={styles.eventMeta}>
                <Ionicons name="location-outline" size={12} color="#6B7280" />
                <Text style={styles.eventMetaText} numberOfLines={1}>
                  {params.eventLocation}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Ticket Price</Text>
            <Text style={styles.priceValue}>${price}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Service Fee</Text>
            <Text style={styles.priceValue}>$0</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${price}</Text>
          </View>
        </View>

        {/* PAYMENT METHOD */}
        <Text style={styles.methodHeader}>Payment Method</Text>

        {[
          {
            key: "qris",
            icon: "qr-code",
            title: "QRIS",
            subtitle: "Scan QR with any e-wallet",
          },
          {
            key: "card",
            icon: "card",
            title: "Credit / Debit Card",
            subtitle: "Visa, Mastercard, JCB",
          },
          {
            key: "cash",
            icon: "cash",
            title: "Pay at Venue",
            subtitle: "Cash on arrival",
          },
        ].map((method: any) => (
          <TouchableOpacity
            key={method.key}
            activeOpacity={0.85}
            onPress={() => setSelectedMethod(method.key)}
            style={[
              styles.methodCard,
              selectedMethod === method.key && styles.methodCardActive,
            ]}
          >
            <View style={styles.methodIcon}>
              <Ionicons name={method.icon} size={22} color="#3FA16F" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.methodTitle}>{method.title}</Text>

              <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
            </View>

            <View
              style={[
                styles.radio,
                selectedMethod === method.key && styles.radioActive,
              ]}
            >
              {selectedMethod === method.key && (
                <View style={styles.radioDot} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.85} onPress={handleContinue}>
          <LinearGradient
            colors={["#A9E5BC", "#3FA16F"]}
            style={styles.payButton}
          >
            <Text style={styles.payText}>Continue • ${price}</Text>

            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* CUSTOM ALERT */}
      <Modal visible={showCustomAlert} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.alertBox}>
            <View style={styles.alertIconContainer}>
              <LinearGradient
                colors={["#A9E5BC", "#3FA16F"]}
                style={styles.alertIconCircle}
              >
                <Ionicons name="checkmark" size={36} color="#fff" />
              </LinearGradient>
            </View>

            <Text style={styles.alertTitle}>{alertTitle}</Text>

            <Text style={styles.alertMessage}>{alertMessage}</Text>

            <TouchableOpacity onPress={() => setShowCustomAlert(false)}>
              <LinearGradient
                colors={["#A9E5BC", "#3FA16F"]}
                style={styles.alertButton}
              >
                <Text style={styles.alertButtonText}>OK</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#2F6B4F",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingVertical: 12,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },

  scroll: {
    padding: 20,
    paddingBottom: 30,
  },

  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
  },

  sectionTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 14,
  },

  eventRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  eventImage: {
    width: 70,
    height: 70,
    borderRadius: 14,
    backgroundColor: "#E5E7EB",
  },

  eventName: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 6,
  },

  eventMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },

  eventMetaText: {
    marginLeft: 5,
    color: "#6B7280",
    fontSize: 11,
    flex: 1,
  },

  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 14,
  },

  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  priceLabel: {
    color: "#6B7280",
    fontSize: 14,
  },

  priceValue: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
  },

  totalLabel: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "bold",
  },

  totalValue: {
    color: "#3FA16F",
    fontSize: 20,
    fontWeight: "bold",
  },

  methodHeader: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    marginLeft: 4,
  },

  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },

  methodCardActive: {
    borderColor: "#3FA16F",
  },

  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: "#E7F7EF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  methodTitle: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "bold",
  },

  methodSubtitle: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 2,
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },

  radioActive: {
    borderColor: "#3FA16F",
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#3FA16F",
  },

  footer: {
    padding: 20,
    paddingTop: 12,
    backgroundColor: "#2F6B4F",
  },

  payButton: {
    height: 58,
    borderRadius: 999,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  payText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  alertBox: {
    width: "100%",
    backgroundColor: "#2E6B4F",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
  },

  alertIconContainer: {
    marginBottom: 16,
  },

  alertIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },

  alertTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },

  alertMessage: {
    color: "#D1FAE5",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },

  alertButton: {
    paddingHorizontal: 42,
    paddingVertical: 12,
    borderRadius: 999,
  },

  alertButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
