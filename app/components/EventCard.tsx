import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import React from "react";

import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } =
  Dimensions.get("window");

export default function EventCard({
  event,
}: any) {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.card}
      onPress={() =>
        router.push(
          `/page/eventDetail?id=${event?.id}`
        )
      }
    >
      {/* IMAGE */}
      <View>
        <Image
          source={{
            uri:
              event?.image,
          }}
          style={styles.image}
        />

        {/* DATE */}
        <View style={styles.badge}>
          <Ionicons
            name="calendar"
            size={10}
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

      {/* CONTENT */}
      <View style={styles.content}>
        {/* TITLE */}
        <Text
          style={styles.title}
          numberOfLines={2}
        >
          {event?.name}
        </Text>

        {/* TIME */}
        <View
          style={styles.row}
        >
          <Ionicons
            name="time-outline"
            size={14}
            color="#A0D7C6"
          />

          <Text
            style={
              styles.infoText
            }
          >
            {event?.time}
          </Text>
        </View>

        {/* LOCATION */}
        <View
          style={styles.row}
        >
          <Ionicons
            name="location-outline"
            size={14}
            color="#A0D7C6"
          />

          <Text
            style={
              styles.infoText
            }
            numberOfLines={1}
          >
            {event?.location}
          </Text>
        </View>

        {/* QUOTA */}
        <View
          style={
            styles.quotaRow
          }
        >
          <Ionicons
            name="people"
            size={15}
            color="#A0D7C6"
          />

          <Text
            style={
              styles.quotaText
            }
          >
            {event?.participants_count ||
              0}
            {" / "}
            {event?.quota || 0}
            {" Participants"}
          </Text>

          {(event?.participants_count ||
            0) >=
            (event?.quota || 0) &&
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

        {/* CREATED BY */}
        <View
          style={
            styles.creatorContainer
          }
        >
          <Image
            source={{
              uri:
                event?.created_by_photo,
            }}
            style={
              styles.creatorImage
            }
          />

          <View
            style={
              styles.creatorInfo
            }
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
              numberOfLines={1}
            >
              {
                event?.created_by_name
              }
            </Text>
          </View>

          {/* DETAIL BUTTON */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={
              styles.detailButton
            }
            onPress={() =>
              router.push(
                `/page/eventDetail?id=${event?.id}`
              )
            }
          >
            <Ionicons
              name="arrow-forward"
              size={18}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles =
  StyleSheet.create({
    card: {
      width: width * 0.62,
      backgroundColor:
        "#1E4D3A",
      borderRadius: 24,
      marginRight: 16,
      marginBottom: 20,
      overflow: "hidden",

      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },

    image: {
      width: "100%",
      height: width * 0.42,
    },

    badge: {
      position: "absolute",
      top: 10,
      left: 10,
      backgroundColor:
        "rgba(244,162,97,0.95)",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      flexDirection: "row",
      alignItems: "center",
    },

    badgeText: {
      fontSize: 10,
      color: "#fff",
      fontWeight: "bold",
      marginLeft: 4,
    },

    content: {
      padding: 14,
    },

    title: {
      fontSize: 17,
      color: "#fff",
      fontWeight: "bold",
      marginBottom: 12,
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },

    infoText: {
      marginLeft: 6,
      color: "#D1FAE5",
      fontSize: 12,
      flex: 1,
    },

    quotaRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 2,
      marginBottom: 10,
    },

    quotaText: {
      marginLeft: 6,
      color: "#D1FAE5",
      fontSize: 12,
      fontWeight: "600",
    },

    fullBadge: {
      marginLeft: "auto",
      backgroundColor:
        "#FF6B6B",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
    },

    fullText: {
      color: "#fff",
      fontSize: 10,
      fontWeight: "bold",
    },

    creatorContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor:
        "rgba(255,255,255,0.08)",
    },

    creatorImage: {
      width: 42,
      height: 42,
      borderRadius: 999,
      backgroundColor:
        "#fff",
    },

    creatorInfo: {
      marginLeft: 10,
      flex: 1,
    },

    createdBy: {
      color: "#A0D7C6",
      fontSize: 10,
    },

    creatorName: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 13,
      marginTop: 1,
    },

    detailButton: {
      width: 36,
      height: 36,
      borderRadius: 999,
      backgroundColor:
        "#3FA16F",
      justifyContent:
        "center",
      alignItems: "center",
    },
  });