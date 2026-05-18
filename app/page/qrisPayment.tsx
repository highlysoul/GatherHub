import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import {
    router,
    useLocalSearchParams,
} from "expo-router";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    ActivityIndicator,
    Alert,
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "../services/api";

type PaymentStatus =
  | "waiting"
  | "processing"
  | "success"
  | "failed";

export default function QrisPayment() {
  const params =
    useLocalSearchParams();

  const [status, setStatus] =
    useState<PaymentStatus>(
      "waiting"
    );

  const [timeLeft, setTimeLeft] =
    useState(300);

  const scaleAnim = useRef(
    new Animated.Value(0)
  ).current;

  const price = Number(
    params.price || 0
  );

  // COUNTDOWN TIMER
  useEffect(() => {
    if (
      status !== "waiting"
    )
      return;

    const interval =
      setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(
              interval
            );

            setStatus(
              "failed"
            );

            return 0;
          }

          return prev - 1;
        });
      }, 1000);

    return () =>
      clearInterval(interval);
  }, [status]);

  // SUCCESS ANIMATION
  useEffect(() => {
    if (
      status === "success"
    ) {
      Animated.spring(
        scaleAnim,
        {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }
      ).start();
    }
  }, [status]);

  const formatTime = (
    s: number
  ) => {
    const m = Math.floor(
      s / 60
    );

    const sec = s % 60;

    return `${m}:${sec < 10 ? "0" : ""}${sec}`;
  };

  // SIMULATE PAYMENT
  const handleSimulatePay =
    async () => {
      setStatus("processing");

      // Wait 2 seconds to simulate bank confirmation
      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            2000
          )
      );

      try {
        const {
          data: { user },
        } =
          await supabase.auth.getUser();

        if (!user) {
          Alert.alert(
            "Error",
            "Please log in again."
          );

          setStatus("failed");

          return;
        }

        // GENERATE CODES
        const txCode =
          "TX-" +
          Date.now()
            .toString(36)
            .toUpperCase() +
          "-" +
          Math.random()
            .toString(36)
            .substring(2, 6)
            .toUpperCase();

        const ticketCode =
          "TKT-" +
          Date.now()
            .toString(36)
            .toUpperCase() +
          "-" +
          Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();

        // 1. INSERT TRANSACTION
        const {
          data: txData,
          error: txError,
        } = await supabase
          .from(
            "transactions"
          )
          .insert({
            transaction_code:
              txCode,
            user_id: user.id,
            event_id: Number(
              params.eventId
            ),
            event_name:
              params.eventName,
            quantity: 1,
            unit_price: price,
            total_amount:
              price,
            payment_method:
              params.paymentMethod,
            status: "paid",
            paid_at:
              new Date().toISOString(),
          })
          .select()
          .single();

        if (txError) {
          Alert.alert(
            "Transaction Error",
            txError.message
          );

          setStatus("failed");

          return;
        }

        // 2. INSERT PARTICIPANT (ignore conflict if already joined)
        await supabase
          .from(
            "event_participants"
          )
          .insert({
            event_id: Number(
              params.eventId
            ),
            user_id: user.id,
          });

        // 3. INSERT TICKET
        const {
          data: ticketData,
          error: ticketError,
        } = await supabase
          .from("tickets")
          .insert({
            ticket_code:
              ticketCode,
            event_id: Number(
              params.eventId
            ),
            user_id: user.id,
            user_email:
              user.email,
            event_name:
              params.eventName,
            event_date:
              params.eventDate,
            event_time:
              params.eventTime,
            event_location:
              params.eventLocation,
            event_image:
              params.eventImage,
            price: price,
            status: "active",
          })
          .select()
          .single();

        if (ticketError) {
          Alert.alert(
            "Ticket Error",
            ticketError.message
          );

          setStatus("failed");

          return;
        }

        // 4. UPDATE PARTICIPANT COUNT
        const {
          data: eventData,
        } = await supabase
          .from("events")
          .select(
            "participants_count"
          )
          .eq(
            "id",
            Number(
              params.eventId
            )
          )
          .single();

        await supabase
          .from("events")
          .update({
            participants_count:
              (eventData?.participants_count ||
                0) + 1,
          })
          .eq(
            "id",
            Number(
              params.eventId
            )
          );

        setStatus("success");
      } catch (error: any) {
        console.log(error);

        Alert.alert(
          "Error",
          error.message ||
            "Something went wrong"
        );

        setStatus("failed");
      }
    };

  const handleViewTicket =
    () => {
      router.replace(
        "/page/viewTickets"
      );
    };

  // ====== SUCCESS SCREEN ======
  if (
    status === "success"
  ) {
    return (
      <SafeAreaView
        style={styles.safe}
      >
        <View
          style={
            styles.successContainer
          }
        >
          <Animated.View
            style={[
              styles.successCircle,
              {
                transform: [
                  {
                    scale:
                      scaleAnim,
                  },
                ],
              },
            ]}
          >
            <Ionicons
              name="checkmark"
              size={70}
              color="#fff"
            />
          </Animated.View>

          <Text
            style={
              styles.successTitle
            }
          >
            Payment Successful
          </Text>

          <Text
            style={
              styles.successAmount
            }
          >
            ${price}
          </Text>

          <Text
            style={
              styles.successSubtitle
            }
          >
            Your ticket has
            been issued.
          </Text>

          <TouchableOpacity
            activeOpacity={
              0.85
            }
            onPress={
              handleViewTicket
            }
            style={{
              marginTop: 30,
            }}
          >
            <LinearGradient
              colors={[
                "#A9E5BC",
                "#3FA16F",
              ]}
              style={
                styles.viewTicketBtn
              }
            >
              <Ionicons
                name="ticket"
                size={20}
                color="#fff"
              />

              <Text
                style={
                  styles.viewTicketText
                }
              >
                View My Ticket
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              router.replace(
                "/page/home"
              )
            }
            style={{
              marginTop: 14,
            }}
          >
            <Text
              style={
                styles.backToHome
              }
            >
              Back to Home
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ====== FAILED SCREEN ======
  if (status === "failed") {
    return (
      <SafeAreaView
        style={styles.safe}
      >
        <View
          style={
            styles.successContainer
          }
        >
          <View
            style={
              styles.failedCircle
            }
          >
            <Ionicons
              name="close"
              size={70}
              color="#fff"
            />
          </View>

          <Text
            style={
              styles.successTitle
            }
          >
            Payment Failed
          </Text>

          <Text
            style={
              styles.successSubtitle
            }
          >
            The QR code expired
            or payment was
            cancelled.
          </Text>

          <TouchableOpacity
            activeOpacity={
              0.85
            }
            onPress={() =>
              router.back()
            }
            style={{
              marginTop: 30,
            }}
          >
            <LinearGradient
              colors={[
                "#A9E5BC",
                "#3FA16F",
              ]}
              style={
                styles.viewTicketBtn
              }
            >
              <Text
                style={
                  styles.viewTicketText
                }
              >
                Try Again
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ====== QR CODE SCREEN ======
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
          disabled={
            status ===
            "processing"
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
          QRIS Payment
        </Text>

        <View
          style={{ width: 38 }}
        />
      </View>

      <View
        style={styles.body}
      >
        {/* AMOUNT */}
        <Text
          style={
            styles.amountLabel
          }
        >
          Amount to Pay
        </Text>

        <Text
          style={
            styles.amountValue
          }
        >
          ${price}
        </Text>

        {/* QR CARD */}
        <View
          style={styles.qrCard}
        >
          <View
            style={
              styles.qrHeader
            }
          >
            <Text
              style={
                styles.qrisLogo
              }
            >
              QRIS
            </Text>

            <Text
              style={
                styles.merchantName
              }
            >
              GatherHub
            </Text>
          </View>

          {/* FAKE QR CODE */}
          <View
            style={
              styles.qrContainer
            }
          >
            <View
              style={
                styles.qrGrid
              }
            >
              {Array.from({
                length: 169,
              }).map((_, i) => {
                const filled =
                  (i * 7 + 3) %
                    5 ===
                    0 ||
                  (i * 3) %
                    7 ===
                    0;

                return (
                  <View
                    key={i}
                    style={[
                      styles.qrCell,
                      {
                        backgroundColor:
                          filled
                            ? "#111"
                            : "#fff",
                      },
                    ]}
                  />
                );
              })}
            </View>

            {/* CORNER MARKERS */}
            <View
              style={[
                styles.qrCorner,
                {
                  top: 0,
                  left: 0,
                },
              ]}
            />

            <View
              style={[
                styles.qrCorner,
                {
                  top: 0,
                  right: 0,
                },
              ]}
            />

            <View
              style={[
                styles.qrCorner,
                {
                  bottom: 0,
                  left: 0,
                },
              ]}
            />
          </View>

          <Text
            style={
              styles.qrInstruction
            }
          >
            Scan with your
            e-wallet
          </Text>

          <View
            style={
              styles.timerRow
            }
          >
            <Ionicons
              name="time-outline"
              size={14}
              color="#EF4444"
            />

            <Text
              style={
                styles.timerText
              }
            >
              Expires in{" "}
              {formatTime(
                timeLeft
              )}
            </Text>
          </View>
        </View>

        {/* SIMULATE PAYMENT BUTTON */}
        {status ===
        "processing" ? (
          <View
            style={
              styles.processingBox
            }
          >
            <ActivityIndicator
              size="large"
              color="#fff"
            />

            <Text
              style={
                styles.processingText
              }
            >
              Confirming
              payment...
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={
              0.85
            }
            onPress={
              handleSimulatePay
            }
            style={{
              marginTop: 24,
              width: "100%",
            }}
          >
            <LinearGradient
              colors={[
                "#A9E5BC",
                "#3FA16F",
              ]}
              style={
                styles.simulateBtn
              }
            >
              <Ionicons
                name="checkmark-circle"
                size={20}
                color="#fff"
              />

              <Text
                style={
                  styles.simulateText
                }
              >
                I have paid
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <Text
          style={
            styles.disclaimer
          }
        >
          Demo only • No real
          payment is processed
        </Text>
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

    body: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 10,
    },

    amountLabel: {
      color: "#DDF0E6",
      fontSize: 14,
      marginBottom: 4,
    },

    amountValue: {
      color: "#fff",
      fontSize: 40,
      fontWeight: "bold",
      marginBottom: 24,
    },

    qrCard: {
      backgroundColor: "#fff",
      borderRadius: 24,
      padding: 22,
      alignItems: "center",
      width: "100%",
      shadowColor: "#000",
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 8,
    },

    qrHeader: {
      alignItems: "center",
      marginBottom: 18,
    },

    qrisLogo: {
      color: "#EF4444",
      fontSize: 28,
      fontWeight: "900",
      letterSpacing: 2,
    },

    merchantName: {
      color: "#374151",
      fontSize: 14,
      fontWeight: "600",
      marginTop: 4,
    },

    qrContainer: {
      width: 220,
      height: 220,
      padding: 8,
      backgroundColor:
        "#fff",
      position: "relative",
    },

    qrGrid: {
      width: "100%",
      height: "100%",
      flexDirection: "row",
      flexWrap: "wrap",
    },

    qrCell: {
      width: "7.69%",
      height: "7.69%",
    },

    qrCorner: {
      position: "absolute",
      width: 36,
      height: 36,
      borderColor: "#111",
      borderWidth: 4,
      backgroundColor:
        "transparent",
    },

    qrInstruction: {
      color: "#6B7280",
      fontSize: 13,
      marginTop: 18,
    },

    timerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
    },

    timerText: {
      color: "#EF4444",
      fontSize: 12,
      fontWeight: "600",
      marginLeft: 4,
    },

    simulateBtn: {
      height: 56,
      borderRadius: 999,
      flexDirection: "row",
      justifyContent:
        "center",
      alignItems: "center",
    },

    simulateText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "bold",
      marginLeft: 8,
    },

    processingBox: {
      marginTop: 30,
      alignItems: "center",
    },

    processingText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "600",
      marginTop: 12,
    },

    disclaimer: {
      color: "#A0D7C6",
      fontSize: 11,
      marginTop: 16,
      fontStyle: "italic",
    },

    successContainer: {
      flex: 1,
      justifyContent:
        "center",
      alignItems: "center",
      padding: 30,
    },

    successCircle: {
      width: 130,
      height: 130,
      borderRadius: 999,
      backgroundColor:
        "#3FA16F",
      justifyContent:
        "center",
      alignItems: "center",
      marginBottom: 24,
    },

    failedCircle: {
      width: 130,
      height: 130,
      borderRadius: 999,
      backgroundColor:
        "#EF4444",
      justifyContent:
        "center",
      alignItems: "center",
      marginBottom: 24,
    },

    successTitle: {
      color: "#fff",
      fontSize: 26,
      fontWeight: "bold",
      marginBottom: 6,
    },

    successAmount: {
      color: "#A9E5BC",
      fontSize: 32,
      fontWeight: "bold",
      marginBottom: 8,
    },

    successSubtitle: {
      color: "#DDF0E6",
      fontSize: 14,
      textAlign: "center",
      lineHeight: 22,
    },

    viewTicketBtn: {
      height: 56,
      paddingHorizontal: 28,
      borderRadius: 999,
      flexDirection: "row",
      justifyContent:
        "center",
      alignItems: "center",
    },

    viewTicketText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "bold",
      marginLeft: 8,
    },

    backToHome: {
      color: "#A0D7C6",
      fontSize: 14,
      fontWeight: "600",
      textDecorationLine:
        "underline",
    },
  });