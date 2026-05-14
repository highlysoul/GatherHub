import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function EventCard({ event }: any) {
  return (
    <View style={styles.card}>
      <View>
        <Image
          source={{
            uri:
              event?.image ||
              "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4",
          }}
          style={styles.image}
        />

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{event?.category || "2023"}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.date}>{event?.date || "31 Dec 2023"}</Text>

        <Text style={styles.title} numberOfLines={2}>
          {event?.name || "New Year Event"}
        </Text>

        <View style={styles.avatarRow}>
          <Image
            source={{ uri: "https://i.pravatar.cc/40?img=1" }}
            style={styles.avatar}
          />
          <Image
            source={{ uri: "https://i.pravatar.cc/40?img=2" }}
            style={[styles.avatar, { marginLeft: -8 }]}
          />
          <Image
            source={{ uri: "https://i.pravatar.cc/40?img=3" }}
            style={[styles.avatar, { marginLeft: -8 }]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 150,
    backgroundColor: "#1E4D3A",
    borderRadius: 18,
    marginRight: 12,
    marginBottom: 15,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: 100,
  },

  badge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#F4A261",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  badgeText: {
    fontSize: 9,
    color: "#fff",
    fontWeight: "bold",
  },

  content: {
    padding: 8,
  },

  date: {
    fontSize: 10,
    color: "#A0D7C6",
  },

  title: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
    marginTop: 3,
  },

  avatarRow: {
    flexDirection: "row",
    marginTop: 6,
  },

  avatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#fff",
  },
});
