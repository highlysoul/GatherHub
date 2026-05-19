import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
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

import {
  DatePickerModal,
  TimePickerModal,
  en,
  registerTranslation,
} from "react-native-paper-dates";

import { SafeAreaView } from "react-native-safe-area-context";

registerTranslation("en", en);

type DateFilter = "today" | "tomorrow" | "this week" | "custom" | null;
type TimeFilter = "day" | "night" | "custom" | null;

const { width } = Dimensions.get("window");
const PRICE_OPTIONS = [500, 1000, 1500, 2500, 3500, 4500, 5500];
const BAR_HEIGHTS = [50, 58, 68, 82, 68, 58, 60];

const parseCustomDateParam = (value?: string) => {
  if (!value) return new Date();

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return new Date();

  return new Date(year, month - 1, day);
};

const parseCustomTimeParam = (value?: string) => {
  const date = new Date();
  if (!value) return date;

  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return date;

  date.setHours(hours, minutes, 0, 0);
  return date;
};

const formatDateParam = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatTimeParam = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
};

export default function Filter() {
  const params = useLocalSearchParams<{
    date?: string;
    customDate?: string;
    location?: string;
    latitude?: string;
    longitude?: string;
    maxPrice?: string;
    timeOfDay?: string;
    customTime?: string;
  }>();

  const [location, setLocation] = useState(
    params.location === "current" ? "" : params.location || "",
  );

  const [useCurrentLocation, setUseCurrentLocation] = useState(
    params.location === "current",
  );

  const [date, setDate] = useState<DateFilter>(
    (params.date as DateFilter) || null,
  );

  const [timeOfDay, setTimeOfDay] = useState<TimeFilter>(
    (params.timeOfDay as TimeFilter) || null,
  );

  const [maxPrice, setMaxPrice] = useState(Number(params.maxPrice) || 2500);

  const [customDate, setCustomDate] = useState(
    parseCustomDateParam(params.customDate),
  );

  const [customTime, setCustomTime] = useState(
    parseCustomTimeParam(params.customTime),
  );

  const [openDate, setOpenDate] = useState(false);

  const [openTime, setOpenTime] = useState(false);

  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);

  const [selectedCoords, setSelectedCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(
    params.latitude && params.longitude
      ? {
          latitude: Number(params.latitude),
          longitude: Number(params.longitude),
        }
      : null,
  );

  const goHome = () => {
    router.back();
  };

  const resetFilters = () => {
    setLocation("");
    setUseCurrentLocation(false);
    setDate(null);
    setTimeOfDay(null);
    setMaxPrice(2500);
    setSelectedCoords(null);

    router.replace("/page/home");
  };

  const handleCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});

      setSelectedCoords({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      setUseCurrentLocation(true);

      setLocation("");
      setLocationSuggestions([]);
    } catch (error) {
      console.log(error);
    }
  };

  const searchLocation = async (value: string) => {
    setLocation(value);
    setUseCurrentLocation(false);

    if (value.trim().length < 3) {
      setLocationSuggestions([]);
      return;
    }

    try {
      const result = await Location.geocodeAsync(value);
      setLocationSuggestions(result);
    } catch (error) {
      console.log(error);
    }
  };

  const applyFilters = () => {
    router.replace({
      pathname: "/page/home",

      params: {
        date: date ?? "",

        customDate: date === "custom" ? formatDateParam(customDate) : "",

        customTime: timeOfDay === "custom" ? formatTimeParam(customTime) : "",

        location: useCurrentLocation ? "current" : location,

        latitude: selectedCoords?.latitude?.toString() || "",

        longitude: selectedCoords?.longitude?.toString() || "",

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
      >
        <View style={styles.circleTop} />

        <View style={styles.circleBottomLeft} />

        {/* HEADER */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={goHome}>
            <Ionicons name="chevron-back" size={24} color="#163525" />
          </Pressable>

          <Text style={styles.title}>Filter</Text>

          <View style={{ width: 36 }} />
        </View>

        <View style={styles.form}>
          {/* LOCATION */}
          <Text style={styles.label}>Location</Text>

          <View style={styles.row}>
            <FilterChip
              icon="locate-outline"
              label="Nearest location"
              selected={useCurrentLocation}
              onPress={handleCurrentLocation}
            />
          </View>

          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={14} color="#8fc5aa" />

            <TextInput
              style={styles.searchInput}
              placeholder="Find location"
              placeholderTextColor="#8fc5aa"
              value={location}
              onChangeText={searchLocation}
            />
          </View>

          {/* LOCATION RESULT */}
          {locationSuggestions.length > 0 && (
            <View style={styles.suggestionContainer}>
              {locationSuggestions.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => {
                    setSelectedCoords({
                      latitude: item.latitude,

                      longitude: item.longitude,
                    });

                    setLocationSuggestions([]);
                  }}
                >
                  <Ionicons name="location" size={16} color="#fff" />

                  <Text style={styles.suggestionText}>{location}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* DATE */}
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
              label={
                date === "custom"
                  ? customDate.toLocaleDateString("en-US", {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "Choose date"
              }
              selected={date === "custom"}
              onPress={() => {
                setDate("custom");

                setOpenDate(true);
              }}
            />
          </View>

          {/* TIME */}
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
              label={
                timeOfDay === "custom"
                  ? customTime.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "Choose time"
              }
              selected={timeOfDay === "custom"}
              onPress={() => {
                setTimeOfDay("custom");

                setOpenTime(true);
              }}
            />
          </View>

          {/* PRICE */}
          <Text style={styles.priceTitle}>Price</Text>

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
                    style={[
                      styles.priceBar,
                      {
                        height: BAR_HEIGHTS[index],
                      },
                    ]}
                  />

                  <Text style={styles.priceLabel}>Rp{price}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* BUTTON */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.resetButton]}
              onPress={resetFilters}
            >
              <Text style={styles.actionText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={applyFilters}>
              <LinearGradient
                colors={["#3AAE87", "#2C6FA4"]}
                style={styles.actionButton}
              >
                <Text style={styles.actionText}>Apply</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* DATE PICKER */}
        <DatePickerModal
          locale="en"
          mode="single"
          visible={openDate}
          onDismiss={() => setOpenDate(false)}
          date={customDate}
          onConfirm={({ date }) => {
            setOpenDate(false);

            if (date) {
              setCustomDate(date);
            }
          }}
        />

        {/* TIME PICKER */}
        <TimePickerModal
          visible={openTime}
          onDismiss={() => setOpenTime(false)}
          onConfirm={({ hours, minutes }) => {
            setOpenTime(false);

            const updatedTime = new Date(customTime);

            updatedTime.setHours(hours);
            updatedTime.setMinutes(minutes);

            setCustomTime(updatedTime);
          }}
          hours={customTime.getHours()}
          minutes={customTime.getMinutes()}
          locale="en"
        />
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
        colors={selected ? ["#54C49A", "#2E83A5"] : ["#2E875E", "#256E4E"]}
        style={styles.chip}
      >
        {icon && <Ionicons name={icon} size={12} color="#fff" />}

        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
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
    marginTop: 20,
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
    width: "100%",
    height: 42,
    borderRadius: 12,
    backgroundColor: "#2D8059",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 15,
  },

  searchInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 13,
    paddingVertical: Platform.OS === "web" ? 0 : 2,
  },

  suggestionContainer: {
    width: "100%",
    backgroundColor: "#2D8059",
    borderRadius: 12,
    marginTop: 8,
    overflow: "hidden",
    marginBottom: 14,
  },

  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },

  suggestionText: {
    color: "#fff",
    fontSize: 13,
  },

  priceTitle: {
    color: "#DDF0E6",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 5,
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
    marginTop: 30,
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
