import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import { useState } from "react";

import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

type PaymentMethod =
  | "qris"
  | "card"
  | "cash";

export default function Payment() {
  const params =
    useLocalSearchParams();

  const [
    selectedMethod,
    setSelectedMethod,
  ] = useState<PaymentMethod>(
    "qris"
  );

  const price = Number(
    params.price || 0
  );

  const handleContinue =
    () => {
      router.push({
        pathname:
          "/page/qrisPayment",
        params: {
          ...params,
          paymentMethod:
            selectedMethod,
        },
      });
    };

  return (
    <SafeAreaView
      style={styles.safe}
    >
      {/* HEADER */}
      <View
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() =>
            router.back()
          }
          style={
            styles.backButton
          }
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color="#fff"
          />
        </TouchableOpacity>

        <Text
          style={
            styles.headerTitle
          }
        >
          Checkout
        </Text>

        <View
          style={{ width: 38 }}
        />
      </View>

      <ScrollView
        contentContainerStyle={
          styles.scroll
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* ORDER SUMMARY */}
        <View
          style={
            styles.summaryCard
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Order Summary
          </Text>

          <View
            style={
              styles.eventRow
            }
          >
            <Image
              source={{
                uri: params.eventImage as string,
              }}
              style={
                styles.eventImage
              }
            />

            <View
              style={{
                flex: 1,
                marginLeft: 14,
              }}
            >
              <Text
                style={
                  styles.eventName
                }
                numberOfLines={2}
              >
                {
                  params.eventName
                }
              </Text>

              <View
                style={
                  styles.eventMeta
                }
              >
                <Ionicons
                  name="calendar-outline"
                  size={12}
                  color="#6B7280"
                />

                <Text
                  style={
                    styles.eventMetaText
                  }
                >
                  {
                    params.eventDate
                  }
                  {"  •  "}
                  {
                    params.eventTime
                  }
                </Text>
              </View>

              <View
                style={
                  styles.eventMeta
                }
              >
                <Ionicons
                  name="location-outline"
                  size={12}
                  color="#6B7280"
                />

                <Text
                  style={
                    styles.eventMetaText
                  }
                  numberOfLines={
                    1
                  }
                >
                  {
                    params.eventLocation
                  }
                </Text>
              </View>
            </View>
          </View>

          <View
            style={
              styles.divider
            }
          />

          <View
            style={
              styles.priceRow
            }
          >
            <Text
              style={
                styles.priceLabel
              }
            >
              Ticket Price
            </Text>

            <Text
              style={
                styles.priceValue
              }
            >
              ${price}
            </Text>
          </View>

          <View
            style={
              styles.priceRow
            }
          >
            <Text
              style={
                styles.priceLabel
              }
            >
              Service Fee
            </Text>

            <Text
              style={
                styles.priceValue
              }
            >
              $0
            </Text>
          </View>

          <View
            style={
              styles.divider
            }
          />

          <View
            style={
              styles.priceRow
            }
          >
            <Text
              style={
                styles.totalLabel
              }
            >
              Total
            </Text>

            <Text
              style={
                styles.totalValue
              }
            >
              ${price}
            </Text>
          </View>
        </View>

        {/* PAYMENT METHOD */}
        <Text
          style={
            styles.methodHeader
          }
        >
          Payment Method
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            setSelectedMethod(
              "qris"
            )
          }
          style={[
            styles.methodCard,
            selectedMethod ===
              "qris" &&
              styles.methodCardActive,
          ]}
        >
          <View
            style={
              styles.methodIcon
            }
          >
            <Ionicons
              name="qr-code"
              size={22}
              color="#3FA16F"
            />
          </View>

          <View
            style={{ flex: 1 }}
          >
            <Text
              style={
                styles.methodTitle
              }
            >
              QRIS
            </Text>

            <Text
              style={
                styles.methodSubtitle
              }
            >
              Scan QR with any
              e-wallet
            </Text>
          </View>

          <View
            style={[
              styles.radio,
              selectedMethod ===
                "qris" &&
                styles.radioActive,
            ]}
          >
            {selectedMethod ===
              "qris" && (
              <View
                style={
                  styles.radioDot
                }
              />
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            setSelectedMethod(
              "card"
            )
          }
          style={[
            styles.methodCard,
            selectedMethod ===
              "card" &&
              styles.methodCardActive,
          ]}
        >
          <View
            style={
              styles.methodIcon
            }
          >
            <Ionicons
              name="card"
              size={22}
              color="#3FA16F"
            />
          </View>

          <View
            style={{ flex: 1 }}
          >
            <Text
              style={
                styles.methodTitle
              }
            >
              Credit / Debit
              Card
            </Text>

            <Text
              style={
                styles.methodSubtitle
              }
            >
              Visa, Mastercard,
              JCB
            </Text>
          </View>

          <View
            style={[
              styles.radio,
              selectedMethod ===
                "card" &&
                styles.radioActive,
            ]}
          >
            {selectedMethod ===
              "card" && (
              <View
                style={
                  styles.radioDot
                }
              />
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            setSelectedMethod(
              "cash"
            )
          }
          style={[
            styles.methodCard,
            selectedMethod ===
              "cash" &&
              styles.methodCardActive,
          ]}
        >
          <View
            style={
              styles.methodIcon
            }
          >
            <Ionicons
              name="cash"
              size={22}
              color="#3FA16F"
            />
          </View>

          <View
            style={{ flex: 1 }}
          >
            <Text
              style={
                styles.methodTitle
              }
            >
              Pay at Venue
            </Text>

            <Text
              style={
                styles.methodSubtitle
              }
            >
              Cash on arrival
            </Text>
          </View>

          <View
            style={[
              styles.radio,
              selectedMethod ===
                "cash" &&
                styles.radioActive,
            ]}
          >
            {selectedMethod ===
              "cash" && (
              <View
                style={
                  styles.radioDot
                }
              />
            )}
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* FOOTER PAY BUTTON */}
      <View
        style={styles.footer}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={
            handleContinue
          }
        >
          <LinearGradient
            colors={[
              "#A9E5BC",
              "#3FA16F",
            ]}
            style={
              styles.payButton
            }
          >
            <Text
              style={
                styles.payText
              }
            >
              Continue • $
              {price}
            </Text>

            <Ionicons
              name="arrow-forward"
              size={20}
              color="#fff"
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor:
        "#2F6B4F",
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      paddingHorizontal: 22,
      paddingVertical: 12,
    },

    backButton: {
      width: 38,
      height: 38,
      borderRadius: 999,
      backgroundColor:
        "rgba(255,255,255,0.18)",
      justifyContent:
        "center",
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
      backgroundColor:
        "#E5E7EB",
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
      backgroundColor:
        "#F3F4F6",
      marginVertical: 14,
    },

    priceRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
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
      borderColor:
        "transparent",
    },

    methodCardActive: {
      borderColor:
        "#3FA16F",
    },

    methodIcon: {
      width: 44,
      height: 44,
      borderRadius: 999,
      backgroundColor:
        "#E7F7EF",
      justifyContent:
        "center",
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
      justifyContent:
        "center",
      alignItems: "center",
    },

    radioActive: {
      borderColor:
        "#3FA16F",
    },

    radioDot: {
      width: 10,
      height: 10,
      borderRadius: 999,
      backgroundColor:
        "#3FA16F",
    },

    footer: {
      padding: 20,
      paddingTop: 12,
      backgroundColor:
        "#2F6B4F",
    },

    payButton: {
      height: 58,
      borderRadius: 999,
      flexDirection: "row",
      justifyContent:
        "center",
      alignItems: "center",
    },

    payText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
      marginRight: 8,
    },
  });
