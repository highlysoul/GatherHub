import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../services/api";

const { width } =
  Dimensions.get("window");

export default function TicketDetail() {
  const { id } =
    useLocalSearchParams();

  const [ticket, setTicket] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (id) {
      fetchTicket();
    }
  }, [id]);

  const fetchTicket =
    async () => {
      try {
        const {
          data,
          error,
        } = await supabase
          .from("tickets")
          .select("*")
          .eq("id", id)
          .single();

        if (!error) {
          setTicket(data);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

  const handleCancel =
    async () => {
      Alert.alert(
        "Cancel Ticket",
        "Are you sure you want to cancel this ticket?",
        [
          {
            text: "No",
            style: "cancel",
          },
          {
            text: "Yes, Cancel",
            style:
              "destructive",
            onPress:
              async () => {
                const {
                  error,
                } =
                  await supabase
                    .from(
                      "tickets"
                    )
                    .update({
                      status:
                        "cancelled",
                    })
                    .eq(
                      "id",
                      id
                    );

                if (!error) {
                  Alert.alert(
                    "Cancelled",
                    "Your ticket has been cancelled."
                  );

                  fetchTicket();
                }
              },
          },
        ]
      );
    };

  if (loading) {
    return (
      <SafeAreaView
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color="#fff"
        />
      </SafeAreaView>
    );
  }

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
          Your Ticket
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
        {/* TICKET CARD */}
        <View
          style={
            styles.ticketCard
          }
        >
          <Image
            source={{
              uri:
                ticket?.event_image,
            }}
            style={
              styles.eventImage
            }
          />

          <LinearGradient
            colors={[
              "transparent",
              "rgba(0,0,0,0.7)",
            ]}
            style={
              styles.imageOverlay
            }
          />

          <View
            style={
              styles.eventTitleContainer
            }
          >
            <Text
              style={
                styles.eventTitle
              }
            >
              {
                ticket?.event_name
              }
            </Text>
          </View>

          {/* DETAILS */}
          <View
            style={
              styles.detailsSection
            }
          >
            <View
              style={
                styles.detailRow
              }
            >
              <View
                style={
                  styles.detailItem
                }
              >
                <Text
                  style={
                    styles.detailLabel
                  }
                >
                  Date
                </Text>

                <Text
                  style={
                    styles.detailValue
                  }
                >
                  {
                    ticket?.event_date
                  }
                </Text>
              </View>

              <View
                style={
                  styles.detailItem
                }
              >
                <Text
                  style={
                    styles.detailLabel
                  }
                >
                  Time
                </Text>

                <Text
                  style={
                    styles.detailValue
                  }
                >
                  {
                    ticket?.event_time
                  }
                </Text>
              </View>
            </View>

            <View
              style={
                styles.detailRow
              }
            >
              <View
                style={{
                  flex: 1,
                }}
              >
                <Text
                  style={
                    styles.detailLabel
                  }
                >
                  Location
                </Text>

                <Text
                  style={
                    styles.detailValue
                  }
                >
                  {
                    ticket?.event_location
                  }
                </Text>
              </View>
            </View>

            <View
              style={
                styles.detailRow
              }
            >
              <View
                style={
                  styles.detailItem
                }
              >
                <Text
                  style={
                    styles.detailLabel
                  }
                >
                  Holder
                </Text>

                <Text
                  style={
                    styles.detailValue
                  }
                  numberOfLines={
                    1
                  }
                >
                  {
                    ticket?.user_email
                  }
                </Text>
              </View>

              <View
                style={
                  styles.detailItem
                }
              >
                <Text
                  style={
                    styles.detailLabel
                  }
                >
                  Price
                </Text>

                <Text
                  style={
                    styles.detailValue
                  }
                >
                  $
                  {ticket?.price ||
                    0}
                </Text>
              </View>
            </View>
          </View>

          {/* DASHED DIVIDER + CIRCLES */}
          <View
            style={
              styles.dividerWrap
            }
          >
            <View
              style={
                styles.circleLeft
              }
            />

            <View
              style={
                styles.dashedLine
              }
            />

            <View
              style={
                styles.circleRight
              }
            />
          </View>

          {/* TICKET CODE */}
          <View
            style={
              styles.codeSection
            }
          >
            <Text
              style={
                styles.codeLabel
              }
            >
              Ticket Code
            </Text>

            <Text
              style={
                styles.codeValue
              }
            >
              {
                ticket?.ticket_code
              }
            </Text>

            {/* BARCODE PLACEHOLDER */}
            <View
              style={
                styles.barcode
              }
            >
              {Array.from({
                length: 40,
              }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.bar,
                    {
                      width:
                        Math.random() >
                        0.5
                          ? 2
                          : 3,
                      opacity:
                        Math.random() >
                        0.3
                          ? 1
                          : 0.4,
                    },
                  ]}
                />
              ))}
            </View>

            <View
              style={
                styles.statusContainer
              }
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      ticket?.status ===
                      "active"
                        ? "#3FA16F"
                        : ticket?.status ===
                            "used"
                          ? "#6B7280"
                          : "#EF4444",
                  },
                ]}
              />

              <Text
                style={
                  styles.statusLabel
                }
              >
                {ticket?.status?.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* CANCEL BUTTON */}
        {ticket?.status ===
          "active" && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={
              handleCancel
            }
            style={
              styles.cancelButton
            }
          >
            <Ionicons
              name="close-circle"
              size={18}
              color="#fff"
            />

            <Text
              style={
                styles.cancelText
              }
            >
              Cancel Ticket
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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

    loadingContainer: {
      flex: 1,
      justifyContent:
        "center",
      alignItems: "center",
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
      paddingBottom: 40,
    },

    ticketCard: {
      backgroundColor: "#fff",
      borderRadius: 24,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 8,
    },

    eventImage: {
      width: "100%",
      height: width * 0.55,
    },

    imageOverlay: {
      position: "absolute",
      width: "100%",
      height: width * 0.55,
    },

    eventTitleContainer: {
      position: "absolute",
      bottom: width * 0.4,
      left: 20,
      right: 20,
    },

    eventTitle: {
      color: "#fff",
      fontSize: 22,
      fontWeight: "bold",
    },

    detailsSection: {
      padding: 22,
    },

    detailRow: {
      flexDirection: "row",
      marginBottom: 18,
    },

    detailItem: {
      flex: 1,
    },

    detailLabel: {
      color: "#9CA3AF",
      fontSize: 11,
      fontWeight: "600",
      letterSpacing: 0.5,
      textTransform:
        "uppercase",
      marginBottom: 4,
    },

    detailValue: {
      color: "#111827",
      fontSize: 14,
      fontWeight: "700",
    },

    dividerWrap: {
      flexDirection: "row",
      alignItems: "center",
    },

    circleLeft: {
      width: 24,
      height: 24,
      borderRadius: 999,
      backgroundColor:
        "#2F6B4F",
      marginLeft: -12,
    },

    circleRight: {
      width: 24,
      height: 24,
      borderRadius: 999,
      backgroundColor:
        "#2F6B4F",
      marginRight: -12,
    },

    dashedLine: {
      flex: 1,
      borderTopWidth: 2,
      borderColor: "#D1D5DB",
      borderStyle: "dashed",
      marginHorizontal: 6,
    },

    codeSection: {
      padding: 22,
      alignItems: "center",
    },

    codeLabel: {
      color: "#9CA3AF",
      fontSize: 11,
      fontWeight: "600",
      letterSpacing: 0.5,
      textTransform:
        "uppercase",
      marginBottom: 6,
    },

    codeValue: {
      color: "#111827",
      fontSize: 18,
      fontWeight: "bold",
      letterSpacing: 2,
      marginBottom: 16,
    },

    barcode: {
      flexDirection: "row",
      alignItems: "center",
      height: 56,
      gap: 2,
      marginBottom: 16,
    },

    bar: {
      height: "100%",
      backgroundColor:
        "#111827",
    },

    statusContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
    },

    statusDot: {
      width: 10,
      height: 10,
      borderRadius: 999,
      marginRight: 6,
    },

    statusLabel: {
      color: "#374151",
      fontSize: 12,
      fontWeight: "bold",
      letterSpacing: 1,
    },

    cancelButton: {
      marginTop: 18,
      backgroundColor:
        "#EF4444",
      paddingVertical: 14,
      borderRadius: 999,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
    },

    cancelText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "700",
      marginLeft: 6,
    },
  });