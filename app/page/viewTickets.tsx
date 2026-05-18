import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
    router,
    useFocusEffect,
} from "expo-router";

import React, {
    useCallback,
    useState,
} from "react";

import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "../services/api";

export default function ViewTickets() {
  const [tickets, setTickets] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, [])
  );

  const fetchTickets =
    async () => {
      try {
        setLoading(true);

        const {
          data: { user },
        } =
          await supabase.auth.getUser();

        if (!user) {
          setTickets([]);

          return;
        }

        const {
          data,
          error,
        } = await supabase
          .from("tickets")
          .select("*")
          .eq("user_id", user.id)
          .order(
            "purchased_at",
            {
              ascending: false,
            }
          );

        if (!error && data) {
          setTickets(data);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

  const onRefresh =
    async () => {
      setRefreshing(true);

      await fetchTickets();

      setRefreshing(false);
    };

  const renderTicket = ({
    item,
  }: any) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={() =>
        router.push(
          `./page/ticketDetail?id=${item.id}`
        )
      }
    >
      <Image
        source={{
          uri:
            item?.event_image,
        }}
        style={styles.image}
      />

      <View
        style={styles.cardBody}
      >
        <View
          style={
            styles.statusBadge
          }
        >
          <Ionicons
            name={
              item?.status ===
              "used"
                ? "checkmark-done"
                : "ticket"
            }
            size={11}
            color="#fff"
          />

          <Text
            style={
              styles.statusText
            }
          >
            {item?.status?.toUpperCase()}
          </Text>
        </View>

        <Text
          style={styles.title}
          numberOfLines={2}
        >
          {item?.event_name}
        </Text>

        <View style={styles.row}>
          <Ionicons
            name="calendar"
            size={13}
            color="#A0D7C6"
          />

          <Text
            style={
              styles.infoText
            }
          >
            {item?.event_date}
            {"  •  "}
            {item?.event_time}
          </Text>
        </View>

        <View style={styles.row}>
          <Ionicons
            name="location"
            size={13}
            color="#A0D7C6"
          />

          <Text
            style={
              styles.infoText
            }
            numberOfLines={1}
          >
            {
              item?.event_location
            }
          </Text>
        </View>

        <View
          style={
            styles.footer
          }
        >
          <Text
            style={
              styles.codeText
            }
          >
            {item?.ticket_code}
          </Text>

          <View
            style={
              styles.viewButton
            }
          >
            <Text
              style={
                styles.viewText
              }
            >
              View
            </Text>

            <Ionicons
              name="arrow-forward"
              size={14}
              color="#fff"
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

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
          My Tickets
        </Text>

        <View
          style={{ width: 38 }}
        />
      </View>

      <FlatList
        data={tickets}
        keyExtractor={(item) =>
          item.id.toString()
        }
        renderItem={
          renderTicket
        }
        contentContainerStyle={
          styles.list
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              onRefresh
            }
            tintColor="#fff"
          />
        }
        ListEmptyComponent={
          <View
            style={
              styles.emptyContainer
            }
          >
            <Ionicons
              name="ticket-outline"
              size={72}
              color="#A0D7C6"
            />

            <Text
              style={
                styles.emptyTitle
              }
            >
              No Tickets Yet
            </Text>

            <Text
              style={
                styles.emptySubtitle
              }
            >
              Browse events and
              purchase your
              first ticket.
            </Text>

            <TouchableOpacity
              activeOpacity={
                0.85
              }
              onPress={() =>
                router.push(
                  "/page/home"
                )
              }
              style={{
                marginTop: 20,
              }}
            >
              <LinearGradient
                colors={[
                  "#A9E5BC",
                  "#3FA16F",
                ]}
                style={
                  styles.browseButton
                }
              >
                <Text
                  style={
                    styles.browseText
                  }
                >
                  Browse Events
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        }
      />
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

    list: {
      padding: 20,
      paddingBottom: 40,
    },

    card: {
      backgroundColor:
        "#1E4D3A",
      borderRadius: 22,
      marginBottom: 16,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },

    image: {
      width: "100%",
      height: 140,
    },

    cardBody: {
      padding: 16,
    },

    statusBadge: {
      alignSelf:
        "flex-start",
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "rgba(244,162,97,0.95)",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      marginBottom: 8,
    },

    statusText: {
      color: "#fff",
      fontSize: 10,
      fontWeight: "bold",
      marginLeft: 4,
    },

    title: {
      color: "#fff",
      fontSize: 17,
      fontWeight: "bold",
      marginBottom: 10,
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },

    infoText: {
      marginLeft: 6,
      color: "#D1FAE5",
      fontSize: 12,
      flex: 1,
    },

    footer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor:
        "rgba(255,255,255,0.08)",
      borderStyle: "dashed",
    },

    codeText: {
      color: "#A0D7C6",
      fontSize: 11,
      fontWeight: "600",
      letterSpacing: 1,
    },

    viewButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#3FA16F",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
    },

    viewText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "700",
      marginRight: 4,
    },

    emptyContainer: {
      alignItems: "center",
      paddingTop: 80,
      paddingHorizontal: 30,
    },

    emptyTitle: {
      color: "#fff",
      fontSize: 20,
      fontWeight: "bold",
      marginTop: 16,
    },

    emptySubtitle: {
      color: "#A0D7C6",
      fontSize: 14,
      textAlign: "center",
      marginTop: 8,
      lineHeight: 22,
    },

    browseButton: {
      paddingHorizontal: 28,
      paddingVertical: 14,
      borderRadius: 999,
    },

    browseText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "700",
    },
  });