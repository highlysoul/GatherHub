import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
    router,
    useLocalSearchParams,
} from "expo-router";

import {
    useEffect,
    useState,
} from "react";

import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "../services/api";

const { width } =
  Dimensions.get("window");

export default function EventDetail() {
  const { id } =
    useLocalSearchParams();

  const [event, setEvent] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [joining, setJoining] =
    useState(false);

  const [joined, setJoined] =
    useState(false);

  useEffect(() => {
    if (id) {
      fetchEvent();
      checkJoined();
    }
  }, [id]);

  const fetchEvent =
    async () => {
      try {
        const {
          data,
          error,
        } = await supabase
          .from("events")
          .select("*")
          .eq("id", id)
          .single();

        if (!error) {
          setEvent(data);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

  const checkJoined =
    async () => {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) return;

      const { data } =
        await supabase
          .from(
            "event_participants"
          )
          .select("*")
          .eq("event_id", id)
          .eq("user_id", user.id)
          .maybeSingle();

      setJoined(!!data);
    };

  const handleJoin =
    async () => {
      try {
        setJoining(true);

        const {
          data: { user },
        } =
          await supabase.auth.getUser();

        if (!user) {
          Alert.alert(
            "Login Required",
            "Please login first."
          );

          return;
        }

        if (
          joined
        ) {
          Alert.alert(
            "Already Joined",
            "You already joined this event."
          );

          return;
        }

        if (
          (event?.participants_count ||
            0) >=
          (event?.quota || 0)
        ) {
          Alert.alert(
            "Event Full",
            "This event has reached maximum participants."
          );

          return;
        }

        // INSERT PARTICIPANT
        const {
          error:
            participantError,
        } = await supabase
          .from(
            "event_participants"
          )
          .insert({
            event_id: id,
            user_id: user.id,
          });

        if (
          participantError
        ) {
          console.log(
            participantError
          );

          Alert.alert(
            "Join Failed",
            participantError.message
          );

          return;
        }

        // UPDATE COUNT
        const {
          error: updateError,
        } = await supabase
          .from("events")
          .update({
            participants_count:
              (event?.participants_count ||
                0) + 1,
          })
          .eq("id", id);

        if (updateError) {
          console.log(
            updateError
          );

          return;
        }

        setJoined(true);

        fetchEvent();

        Alert.alert(
          "Success",
          "You joined the event successfully."
        );
      } catch (error) {
        console.log(error);
      } finally {
        setJoining(false);
      }
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
      edges={[
        "top",
        "bottom",
      ]}
    >
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          paddingBottom: 35,
        }}
      >
        {/* IMAGE */}
        <View
          style={
            styles.imageContainer
          }
        >
          <Image
            source={{
              uri:
                event?.image,
            }}
            style={styles.image}
          />

          {/* OVERLAY */}
          <LinearGradient
            colors={[
              "transparent",
              "rgba(0,0,0,0.7)",
            ]}
            style={
              styles.overlay
            }
          />

          {/* BACK */}
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
              color="#fff"
            />
          </TouchableOpacity>

          {/* TITLE */}
          <View
            style={
              styles.titleContainer
            }
          >
            <Text
              style={styles.title}
            >
              {event?.name}
            </Text>

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
                {event?.date}
              </Text>
            </View>
          </View>
        </View>

        {/* CONTENT */}
        <View
          style={styles.content}
        >
          {/* INFO CARD */}
          <View
            style={
              styles.infoCard
            }
          >
            {/* TIME */}
            <View
              style={styles.infoRow}
            >
              <View
                style={
                  styles.iconCircle
                }
              >
                <Ionicons
                  name="time"
                  size={18}
                  color="#3FA16F"
                />
              </View>

              <View>
                <Text
                  style={
                    styles.infoLabel
                  }
                >
                  Time
                </Text>

                <Text
                  style={
                    styles.infoValue
                  }
                >
                  {event?.time}
                </Text>
              </View>
            </View>

            {/* LOCATION */}
            <View
              style={styles.infoRow}
            >
              <View
                style={
                  styles.iconCircle
                }
              >
                <Ionicons
                  name="location"
                  size={18}
                  color="#3FA16F"
                />
              </View>

              <View
                style={{ flex: 1 }}
              >
                <Text
                  style={
                    styles.infoLabel
                  }
                >
                  Location
                </Text>

                <Text
                  style={
                    styles.infoValue
                  }
                >
                  {event?.location}
                </Text>
              </View>
            </View>

            {/* PARTICIPANTS */}
            <View
              style={styles.infoRow}
            >
              <View
                style={
                  styles.iconCircle
                }
              >
                <Ionicons
                  name="people"
                  size={18}
                  color="#3FA16F"
                />
              </View>

              <View>
                <Text
                  style={
                    styles.infoLabel
                  }
                >
                  Participants
                </Text>

                <Text
                  style={
                    styles.infoValue
                  }
                >
                  {
                    event?.participants_count
                  }
                  {" / "}
                  {event?.quota}
                </Text>
              </View>

              {(event?.participants_count ||
                0) >=
                (event?.quota ||
                  0) &&
                event?.quota >
                  0 && (
                  <View
                    style={
                      styles.fullBadge
                    }
                  >
                    <Text
                      style={
                        styles.fullText
                      }
                    >
                      FULL
                    </Text>
                  </View>
                )}
            </View>
          </View>

          {/* CREATOR */}
          <View
            style={
              styles.creatorCard
            }
          >
            <Image
              source={{
                uri:
                  event?.created_by_photo ||
                  "https://ui-avatars.com/api/?name=User",
              }}
              style={
                styles.creatorImage
              }
            />

            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={
                  styles.createdBy
                }
              >
                Created by
              </Text>

              <Text
                style={
                  styles.creatorName
                }
              >
                {
                  event?.created_by_name
                }
              </Text>
            </View>
          </View>

          {/* DESCRIPTION */}
          <View
            style={
              styles.descriptionContainer
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              About Event
            </Text>

            <Text
              style={
                styles.description
              }
            >
              {
                event?.description
              }
            </Text>
          </View>

          {/* JOIN BUTTON */}
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={
              joining ||
              joined ||
              (event?.participants_count ||
                0) >=
                (event?.quota ||
                  0)
            }
            onPress={
              handleJoin
            }
          >
            <LinearGradient
              colors={
                joined
                  ? [
                      "#5EBA7D",
                      "#3FA16F",
                    ]
                  : (event?.participants_count ||
                        0) >=
                      (event?.quota ||
                        0)
                    ? [
                        "#8E8E8E",
                        "#707070",
                      ]
                    : [
                        "#A9E5BC",
                        "#3FA16F",
                      ]
              }
              style={
                styles.joinButton
              }
            >
              <Ionicons
                name={
                  joined
                    ? "checkmark-circle"
                    : "people"
                }
                size={20}
                color="#fff"
              />

              <Text
                style={
                  styles.joinText
                }
              >
                {joining
                  ? "Joining..."
                  : joined
                    ? "Joined Event"
                    : (event?.participants_count ||
                          0) >=
                        (event?.quota ||
                          0)
                      ? "Event Full"
                      : "Join Event"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor:
        "#f3f4f6",
    },

    container: {
      flex: 1,
      backgroundColor:
        "#f3f4f6",
    },

    loadingContainer: {
      flex: 1,
      justifyContent:
        "center",
      alignItems: "center",
      backgroundColor:
        "#2F6B4F",
    },

    imageContainer: {
      width: "100%",
      height: width * 1,
      position: "relative",
    },

    image: {
      width: "100%",
      height: "100%",
    },

    overlay: {
      position: "absolute",
      width: "100%",
      height: "100%",
    },

    backButton: {
      position: "absolute",
      top: 18,
      left: 18,
      width: 44,
      height: 44,
      borderRadius: 999,
      backgroundColor:
        "rgba(0,0,0,0.35)",
      justifyContent:
        "center",
      alignItems: "center",
    },

    titleContainer: {
      position: "absolute",
      bottom: 24,
      left: 22,
      right: 22,
    },

    title: {
      color: "#fff",
      fontSize: width * 0.08,
      fontWeight: "bold",
      marginBottom: 12,
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
    },

    badgeText: {
      color: "#fff",
      fontSize: 11,
      fontWeight: "bold",
      marginLeft: 5,
    },

    content: {
      marginTop: -25,
      backgroundColor:
        "#f3f4f6",
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      padding: 20,
    },

    infoCard: {
      backgroundColor: "#fff",
      borderRadius: 22,
      padding: 18,
      marginBottom: 18,
    },

    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 18,
    },

    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 999,
      backgroundColor:
        "#E7F7EF",
      justifyContent:
        "center",
      alignItems: "center",
      marginRight: 14,
    },

    infoLabel: {
      color: "#9CA3AF",
      fontSize: 12,
      marginBottom: 3,
    },

    infoValue: {
      color: "#111827",
      fontSize: 15,
      fontWeight: "600",
      width: width * 0.5,
    },

    fullBadge: {
      marginLeft: "auto",
      backgroundColor:
        "#FF6B6B",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
    },

    fullText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 10,
    },

    creatorCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#fff",
      borderRadius: 22,
      padding: 16,
      marginBottom: 18,
    },

    creatorImage: {
      width: 58,
      height: 58,
      borderRadius: 999,
      marginRight: 14,
      backgroundColor:
        "#E5E7EB",
    },

    createdBy: {
      color: "#9CA3AF",
      fontSize: 12,
    },

    creatorName: {
      color: "#111827",
      fontSize: 16,
      fontWeight: "bold",
      marginTop: 3,
    },

    descriptionContainer: {
      backgroundColor: "#fff",
      borderRadius: 22,
      padding: 18,
      marginBottom: 24,
    },

    sectionTitle: {
      color: "#111827",
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 12,
    },

    description: {
      color: "#4B5563",
      fontSize: 14,
      lineHeight: 24,
    },

    joinButton: {
      height: 60,
      borderRadius: 999,
      justifyContent:
        "center",
      alignItems: "center",
      flexDirection: "row",
      marginBottom: 10,
    },

    joinText: {
      color: "#fff",
      fontSize: 17,
      fontWeight: "bold",
      marginLeft: 8,
    },
  });