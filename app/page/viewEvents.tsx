import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";

import React, {
    useCallback,
    useState,
} from "react";

import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "../services/api";

export default function ManageEvents() {
  const [events, setEvents] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [limit, setLimit] =
    useState(10);

  const [selectedEvent, setSelectedEvent] =
    useState<any>(null);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [showSuccessModal, setShowSuccessModal] =
    useState(false);

  const [modalMessage, setModalMessage] =
    useState("");

  useFocusEffect(
    useCallback(() => {
      fetchMyEvents();
    }, [limit])
  );

  const fetchMyEvents =
    async () => {
      try {
        setLoading(true);

        const {
          data: { user },
        } =
          await supabase.auth.getUser();

        if (!user) return;

        const {
          data,
          error,
        } = await supabase
          .from("events")
          .select("*")
          .eq(
            "created_by",
            user.id
          )
          .order(
            "created_at",
            {
              ascending:
                false,
            }
          )
          .limit(limit);

        if (!error) {
          setEvents(
            data || []
          );
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);

        setRefreshing(false);
      }
    };

  const handleRefresh =
    async () => {
      setRefreshing(true);

      await fetchMyEvents();
    };

  const handleDelete =
    async () => {
      try {
        if (!selectedEvent)
          return;

        const { error } =
          await supabase
            .from("events")
            .delete()
            .eq(
              "id",
              selectedEvent.id
            );

        if (!error) {
          setShowDeleteModal(
            false
          );

          setModalMessage(
            "Event deleted successfully."
          );

          setShowSuccessModal(
            true
          );

          fetchMyEvents();
        }
      } catch (error) {
        console.log(error);
      }
    };

  const renderItem = ({
    item,
  }: any) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={() =>
        router.push({
          pathname:
            "/page/eventDetail",
          params: {
            id: item.id,
          },
        })
      }
    >
      <Image
        source={{
          uri:
            item.image ||
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
        }}
        style={styles.image}
      />

      <LinearGradient
        colors={[
          "transparent",
          "rgba(0,0,0,0.75)",
        ]}
        style={
          styles.overlay
        }
      />

      <View
        style={
          styles.cardContent
        }
      >
        <View
          style={
            styles.badge
          }
        >
          <Ionicons
            name="calendar"
            size={12}
            color="#fff"
          />

          <Text
            style={
              styles.badgeText
            }
          >
            {item.date}
          </Text>
        </View>

        <Text
          numberOfLines={2}
          style={
            styles.title
          }
        >
          {item.name}
        </Text>

        <View
          style={
            styles.infoRow
          }
        >
          <Ionicons
            name="location"
            size={14}
            color="#fff"
          />

          <Text
            numberOfLines={1}
            style={
              styles.infoText
            }
          >
            {item.location}
          </Text>
        </View>

        <View
          style={
            styles.bottomRow
          }
        >
          <View
            style={
              styles.participantBox
            }
          >
            <Ionicons
              name="people"
              size={14}
              color="#fff"
            />

            <Text
              style={
                styles.participantText
              }
            >
              {
                item.participants_count
              }
              /
              {item.quota}
            </Text>
          </View>

          <View
            style={
              styles.actionRow
            }
          >
            {/* EDIT */}
            <TouchableOpacity
              style={
                styles.actionButton
              }
              onPress={() =>
                router.push({
                  pathname:
                    "/page/editEvent",
                  params: {
                    id: item.id,
                  },
                })
              }
            >
              <Ionicons
                name="create"
                size={18}
                color="#fff"
              />
            </TouchableOpacity>

            {/* DELETE */}
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor:
                    "#DC2626",
                },
              ]}
              onPress={() => {
                setSelectedEvent(
                  item
                );

                setShowDeleteModal(
                  true
                );
              }}
            >
              <Ionicons
                name="trash"
                size={18}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={styles.safe}
      edges={[
        "top",
        "bottom",
      ]}
    >
      <View
        style={
          styles.container
        }
      >
        {/* HEADER */}
        <LinearGradient
          colors={[
            "#1F5235",
            "#2F6B4F",
          ]}
          style={styles.header}
        >
          <View
            style={
              styles.orangeCircle
            }
          />

          <View
            style={
              styles.greenCircle
            }
          />

          <View
            style={
              styles.headerRow
            }
          >
            <TouchableOpacity
              style={
                styles.backButton
              }
              onPress={() =>
                router.back()
              }
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color="#163525"
              />
            </TouchableOpacity>

            <Text
              style={
                styles.headerTitle
              }
            >
              My Events
            </Text>
          </View>

          <Text
            style={
              styles.headerSubtitle
            }
          >
            Manage all your created events
          </Text>
        </LinearGradient>

        {/* FILTER */}
        <View
          style={
            styles.filterRow
          }
        >
          <Text
            style={
              styles.filterTitle
            }
          >
            Show:
          </Text>

          {[10, 25].map(
            (item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.limitButton,
                  limit ===
                    item && {
                    backgroundColor:
                      "#2F6B4F",
                  },
                ]}
                onPress={() =>
                  setLimit(
                    item
                  )
                }
              >
                <Text
                  style={[
                    styles.limitText,
                    limit ===
                      item && {
                      color:
                        "#fff",
                    },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* CONTENT */}
        {loading ? (
          <View
            style={
              styles.loadingContainer
            }
          >
            <ActivityIndicator
              size="large"
              color="#2F6B4F"
            />
          </View>
        ) : (
          <FlatList
            data={events}
            keyExtractor={(
              item
            ) =>
              item.id.toString()
            }
            renderItem={
              renderItem
            }
            showsVerticalScrollIndicator={
              false
            }
            contentContainerStyle={{
              padding: 20,
              paddingBottom: 120,
            }}
            refreshControl={
              <RefreshControl
                refreshing={
                  refreshing
                }
                onRefresh={
                  handleRefresh
                }
                colors={[
                  "#2F6B4F",
                ]}
              />
            }
            ListEmptyComponent={
              <View
                style={
                  styles.emptyContainer
                }
              >
                <Ionicons
                  name="calendar-outline"
                  size={80}
                  color="#9CA3AF"
                />

                <Text
                  style={
                    styles.emptyTitle
                  }
                >
                  No Events Yet
                </Text>

                <Text
                  style={
                    styles.emptyText
                  }
                >
                  You haven't created any events.
                </Text>
              </View>
            }
          />
        )}

        {/* FLOAT BUTTON */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={
            styles.fab
          }
          onPress={() =>
            router.push(
              "/page/createEvent"
            )
          }
        >
          <LinearGradient
            colors={[
              "#A9E5BC",
              "#3FA16F",
            ]}
            style={
              styles.fabGradient
            }
          >
            <Ionicons
              name="add"
              size={30}
              color="#fff"
            />
          </LinearGradient>
        </TouchableOpacity>

        {/* DELETE MODAL */}
        <Modal
          transparent
          visible={
            showDeleteModal
          }
          animationType="fade"
        >
          <View
            style={
              styles.modalOverlay
            }
          >
            <View
              style={
                styles.modalContainer
              }
            >
              <LinearGradient
                colors={[
                  "#FF826F",
                  "#B93224",
                ]}
                style={
                  styles.modalIcon
                }
              >
                <Ionicons
                  name="trash"
                  size={34}
                  color="#fff"
                />
              </LinearGradient>

              <Text
                style={
                  styles.modalTitle
                }
              >
                Delete Event?
              </Text>

              <Text
                style={
                  styles.modalText
                }
              >
                This action cannot be undone.
              </Text>

              <View
                style={
                  styles.modalRow
                }
              >
                <TouchableOpacity
                  style={
                    styles.cancelButton
                  }
                  onPress={() =>
                    setShowDeleteModal(
                      false
                    )
                  }
                >
                  <Text
                    style={
                      styles.cancelText
                    }
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={
                    handleDelete
                  }
                >
                  <LinearGradient
                    colors={[
                      "#FF826F",
                      "#B93224",
                    ]}
                    style={
                      styles.deleteButton
                    }
                  >
                    <Text
                      style={
                        styles.deleteText
                      }
                    >
                      Delete
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* SUCCESS MODAL */}
        <Modal
          transparent
          visible={
            showSuccessModal
          }
          animationType="fade"
        >
          <View
            style={
              styles.modalOverlay
            }
          >
            <View
              style={
                styles.modalContainer
              }
            >
              <LinearGradient
                colors={[
                  "#75DFA8",
                  "#2F9B68",
                ]}
                style={
                  styles.modalIcon
                }
              >
                <Ionicons
                  name="checkmark"
                  size={34}
                  color="#fff"
                />
              </LinearGradient>

              <Text
                style={
                  styles.modalTitle
                }
              >
                Success
              </Text>

              <Text
                style={
                  styles.modalText
                }
              >
                {modalMessage}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setShowSuccessModal(
                    false
                  )
                }
              >
                <LinearGradient
                  colors={[
                    "#A9E5BC",
                    "#3FA16F",
                  ]}
                  style={
                    styles.okButton
                  }
                >
                  <Text
                    style={
                      styles.okText
                    }
                  >
                    OK
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor:
        "#F3F4F6",
    },

    container: {
      flex: 1,
      backgroundColor:
        "#F3F4F6",
    },

    header: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 30,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
      overflow: "hidden",
    },

    orangeCircle: {
      position: "absolute",
      width: 220,
      height: 220,
      borderRadius: 999,
      backgroundColor:
        "#E37059",
      top: -90,
      left: -90,
    },

    greenCircle: {
      position: "absolute",
      width: 90,
      height: 90,
      borderRadius: 999,
      backgroundColor:
        "#49BA8B",
      top: 20,
      right: 20,
      opacity: 0.8,
    },

    headerRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 12,
      backgroundColor:
        "rgba(255,255,255,0.8)",
      justifyContent:
        "center",
      alignItems: "center",
      marginRight: 14,
    },

    headerTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#fff",
    },

    headerSubtitle: {
      marginTop: 12,
      color: "#D1FAE5",
      fontSize: 14,
    },

    filterRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 20,
    },

    filterTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: "#111827",
      marginRight: 12,
    },

    limitButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor:
        "#E5E7EB",
      borderRadius: 999,
      marginRight: 10,
    },

    limitText: {
      fontSize: 14,
      fontWeight: "700",
      color: "#374151",
    },

    loadingContainer: {
      flex: 1,
      justifyContent:
        "center",
      alignItems: "center",
    },

    card: {
      height: 260,
      borderRadius: 28,
      overflow: "hidden",
      marginBottom: 20,
      backgroundColor:
        "#000",
    },

    image: {
      width: "100%",
      height: "100%",
      position: "absolute",
    },

    overlay: {
      position: "absolute",
      width: "100%",
      height: "100%",
    },

    cardContent: {
      flex: 1,
      justifyContent:
        "flex-end",
      padding: 18,
    },

    badge: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "rgba(244,162,97,0.95)",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      marginBottom: 10,
    },

    badgeText: {
      color: "#fff",
      fontSize: 11,
      fontWeight: "bold",
      marginLeft: 5,
    },

    title: {
      fontSize: 22,
      fontWeight: "bold",
      color: "#fff",
      marginBottom: 10,
    },

    infoRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    infoText: {
      color: "#fff",
      fontSize: 13,
      marginLeft: 6,
      flex: 1,
    },

    bottomRow: {
      marginTop: 16,
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
    },

    participantBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "rgba(255,255,255,0.18)",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
    },

    participantText: {
      color: "#fff",
      fontSize: 13,
      fontWeight: "700",
      marginLeft: 6,
    },

    actionRow: {
      flexDirection: "row",
    },

    actionButton: {
      width: 42,
      height: 42,
      borderRadius: 999,
      backgroundColor:
        "#3FA16F",
      justifyContent:
        "center",
      alignItems: "center",
      marginLeft: 10,
    },

    fab: {
      position: "absolute",
      bottom: 30,
      right: 24,
    },

    fabGradient: {
      width: 65,
      height: 65,
      borderRadius: 999,
      justifyContent:
        "center",
      alignItems: "center",
      elevation: 8,
    },

    emptyContainer: {
      marginTop: 100,
      justifyContent:
        "center",
      alignItems: "center",
    },

    emptyTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: "#111827",
      marginTop: 20,
    },

    emptyText: {
      fontSize: 14,
      color: "#6B7280",
      marginTop: 8,
      textAlign: "center",
    },

    modalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(0,0,0,0.45)",
      justifyContent:
        "center",
      alignItems: "center",
      paddingHorizontal: 20,
    },

    modalContainer: {
      width: "100%",
      maxWidth: 340,
      backgroundColor:
        "#296048",
      borderRadius: 28,
      paddingVertical: 30,
      paddingHorizontal: 24,
      alignItems: "center",
    },

    modalIcon: {
      width: 80,
      height: 80,
      borderRadius: 999,
      justifyContent:
        "center",
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
      color: "#D1FAE5",
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 24,
    },

    modalRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    cancelButton: {
      width: 110,
      height: 45,
      borderRadius: 999,
      backgroundColor:
        "#E5E7EB",
      justifyContent:
        "center",
      alignItems: "center",
      marginRight: 12,
    },

    cancelText: {
      color: "#111827",
      fontSize: 15,
      fontWeight: "700",
    },

    deleteButton: {
      width: 110,
      height: 45,
      borderRadius: 999,
      justifyContent:
        "center",
      alignItems: "center",
    },

    deleteText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "700",
    },

    okButton: {
      width: 120,
      height: 45,
      borderRadius: 999,
      justifyContent:
        "center",
      alignItems: "center",
    },

    okText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "700",
    },
  });