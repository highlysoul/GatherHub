import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type DateFilter = "today" | "tomorrow" | "this week" | "custom" | null;
type TimeFilter = "day" | "night" | null;

const { width } = Dimensions.get("window");

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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.circleTop} />
        <View style={styles.circleBottomLeft} />

        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={goHome}
            hitSlop={12}
          >
            <Ionicons name="chevron-back" size={24} color="#163525" />
          </Pressable>

          <Text style={styles.title}>Filter</Text>

          <View style={{ width: 36 }} />
        </View>

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
              <Ionicons
                name="search-outline"
                size={14}
                color="#8fc5aa"
              />

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
              onPress={() =>
                setTimeOfDay(
                  timeOfDay === "day" ? "night" : "day"
                )
              }
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
                      selected
                        ? ["#3AAE87", "#2F85A9"]
                        : ["#2D8059", "#2B7652"]
                    }
                    style={[
                      styles.priceBar,
                      { height: BAR_HEIGHTS[index] },
                    ]}
                  />

                  <Text style={styles.priceLabel}>
                    Rp{price}
                  </Text>
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

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={applyFilters}
            >
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
    </SafeAreaView>
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
        colors={
          selected
            ? ["#54C49A", "#2E83A5"]
            : ["#2E875E", "#256E4E"]
        }
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

        <Text
          style={[
            styles.chipText,
            selected && styles.chipTextSelected,
          ]}
        >
          {label}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#206A40",
  },

  root: {
    flex: 1,
    backgroundColor: "#206A40",
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: width < 380 ? 22 : 30,
    paddingTop: 12,
    paddingBottom: 40,
  },

  circleTop: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 200,
    backgroundColor: "#E86D55",
    top: -180,
    right: -120,
    opacity: 0.5,
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

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    color: "#ffffff",
    fontSize: width < 380 ? 28 : 34,
    fontWeight: "700",
  },

  form: {
    width: "100%",
    alignSelf: "center",
  },

  label: {
    color: "#DDF0E6",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 14,
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
    minHeight: 34,
    paddingHorizontal: 14,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
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
    flex: 1,
    minWidth: 160,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#2D8059",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
    marginTop: 14,
    marginBottom: 14,
  },

  priceBars: {
    height: 110,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  priceItem: {
    alignItems: "center",
    flex: 1,
  },

  priceBar: {
    width: width < 380 ? 18 : 22,
    borderRadius: 8,
  },

  priceLabel: {
    color: "#CFE7DB",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 6,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
    marginTop: 28,
  },

  actionButton: {
    width: 110,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  resetButton: {
    backgroundColor: "#2D8059",
  },

  actionText: {
    color: "#DCEDE6",
    fontSize: 15,
    fontWeight: "700",
  },
});