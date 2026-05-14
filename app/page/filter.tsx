import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type DateFilter = "today" | "tomorrow" | "this week" | "custom" | null;
type TimeFilter = "day" | "night" | null;

const PRICE_OPTIONS = [500, 1000, 1500, 2500, 3500, 4500, 5500];
const BAR_HEIGHTS = [50, 58, 68, 82, 68, 58, 60];

export default function Filter() {
  const [location, setLocation] = useState("");
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [date, setDate] = useState<DateFilter>(null);
  const [timeOfDay, setTimeOfDay] = useState<TimeFilter>(null);
  const [maxPrice, setMaxPrice] = useState(2500);

  const resetFilters = () => {
    setLocation("");
    setUseCurrentLocation(false);
    setDate(null);
    setTimeOfDay(null);
    setMaxPrice(2500);
  };

  const goHome = () => {
    router.replace("/page/home");
  };

  const applyFilters = () => {
    router.replace({
      pathname: "/page/home",
      params: {
        date: date ?? "",
        location: useCurrentLocation ? "current" : location,
        maxPrice: String(maxPrice),
        timeOfDay: timeOfDay ?? "",
      },
    });
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={true}
      bounces={false}
      overScrollMode="never"
    >
      <View style={styles.circleTop} />
      <View style={styles.circleBottomLeft} />
      <Pressable style={styles.backButton} onPress={goHome} hitSlop={12}>
        <Ionicons name="chevron-back" size={30} color="#163525" />
      </Pressable>

      <Text style={styles.title}>Filter</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Location</Text>
        <View style={styles.row}>
          <FilterChip
            icon="locate-outline"
            label="Current location"
            selected={useCurrentLocation}
            onPress={() => setUseCurrentLocation((value) => !value)}
          />

          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={13} color="#8fc5aa" />
            <TextInput
              style={styles.searchInput}
              placeholder="Find location"
              placeholderTextColor="#8fc5aa"
              value={location}
              onChangeText={(value) => {
                setLocation(value);
                setUseCurrentLocation(false);
              }}
            />
          </View>
        </View>

        <Text style={styles.label}>Date</Text>
        <View style={styles.row}>
          <FilterChip
            label="Today"
            selected={date === "today"}
            onPress={() => setDate("today")}
          />
          <FilterChip
            label="Tomorrow"
            selected={date === "tomorrow"}
            onPress={() => setDate("tomorrow")}
          />
          <FilterChip
            label="This week"
            selected={date === "this week"}
            onPress={() => setDate("this week")}
          />
        </View>

        <View style={styles.centerRow}>
          <FilterChip
            icon="calendar"
            label="Choose date"
            selected={date === "custom"}
            onPress={() => setDate("custom")}
          />
        </View>

        <Text style={styles.label}>Time of date</Text>
        <View style={styles.row}>
          <FilterChip
            label="Day"
            selected={timeOfDay === "day"}
            onPress={() => setTimeOfDay("day")}
          />
          <FilterChip
            label="Night"
            selected={timeOfDay === "night"}
            onPress={() => setTimeOfDay("night")}
          />
          <FilterChip
            icon="time-outline"
            label="Choose time"
            selected={false}
            onPress={() => setTimeOfDay(timeOfDay === "day" ? "night" : "day")}
          />
        </View>

        <Text style={styles.priceTitle}>Price (free-500)</Text>

        <View style={styles.priceBars}>
          {PRICE_OPTIONS.map((price, index) => {
            const selected = price <= maxPrice;

            return (
              <Pressable
                key={price}
                style={styles.priceItem}
                onPress={() => setMaxPrice(price)}
              >
                <LinearGradient
                  colors={
                    selected ? ["#3AAE87", "#2F85A9"] : ["#2D8059", "#2B7652"]
                  }
                  style={[styles.priceBar, { height: BAR_HEIGHTS[index] }]}
                />
                <Text style={styles.priceLabel}>Rp{price}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.resetButton]}
            onPress={resetFilters}
            activeOpacity={0.85}
          >
            <Text style={styles.actionText}>Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.85} onPress={applyFilters}>
            <LinearGradient
              colors={["#3AAE87", "#2C6FA4"]}
              style={styles.actionButton}
            >
              <Text style={styles.actionText}>Apply</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function FilterChip({
  icon,
  label,
  selected,
  onPress,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <LinearGradient
        colors={selected ? ["#54C49A", "#2E83A5"] : ["#2E875E", "#256E4E"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.chip}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={12}
            color={selected ? "#ffffff" : "#9FDFC0"}
          />
        )}
        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
          {label}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#206A40",
  },

  content: {
    flexGrow: 1,
    minHeight: "100%",
    backgroundColor: "#206A40",
    paddingHorizontal: 44,
    paddingTop: 42,
    paddingBottom: 12,
  },

  circleTop: {
    position: "absolute",
    width: 360,
    height: 360,
    borderRadius: 220,
    backgroundColor: "#E86D55",
    top: -210,
    right: -120,
    opacity: 0.55,
  },

  circleBottomLeft: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "#48C49B",
    bottom: -50,
    left: -50,
    opacity: 0.75,
  },

  backButton: {
    width: 35,
    height: 35,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.72)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
    elevation: 20,
  },

  title: {
    marginTop: -40,
    color: "#ffffff",
    fontSize: 34,
    fontWeight: "700",
    textAlign: "center",
  },

  form: {
    width: "100%",
    maxWidth: 360,
    alignSelf: "center",
    marginTop: 22,
  },

  label: {
    color: "#DDF0E6",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 16,
    marginTop: 8,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },

  centerRow: {
    alignItems: "center",
    marginBottom: 14,
  },

  chip: {
    minHeight: 30,
    paddingHorizontal: 11,
    borderRadius: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },

  chipText: {
    color: "#A6E1C2",
    fontSize: 13,
    fontWeight: "600",
  },

  chipTextSelected: {
    color: "#ffffff",
  },

  searchBox: {
    width: 200,
    height: 28,
    borderRadius: 7,
    backgroundColor: "#2D8059",
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 5,
  },

  searchInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 13,
    paddingVertical: Platform.OS === "web" ? 0 : 2,
  },

  priceTitle: {
    color: "#DDF0E6",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 10,
  },

  priceBars: {
    height: 92,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 10,
  },

  priceItem: {
    alignItems: "center",
    gap: 6,
  },

  priceBar: {
    width: 22,
    borderRadius: 7,
    opacity: 0.96,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },

  priceLabel: {
    color: "#CFE7DB",
    fontSize: 12,
    fontWeight: "600",
  },

  actions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
    marginTop: 12,
  },

  actionButton: {
    width: 90,
    height: 35,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 4,
  },

  resetButton: {
    backgroundColor: "#2D8059",
  },

  actionText: {
    color: "#DCEDE6",
    fontSize: 14,
    fontWeight: "700",
  },
});
