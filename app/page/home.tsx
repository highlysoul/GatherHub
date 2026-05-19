import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EventCard from "../components/EventCard";
import Sidebar from "../components/Sidebar";
import { supabase } from "../services/api";

type EventSection = "popular" | "running";
const { width } = Dimensions.get("window");

export default function Home() {
  const [events, setEvents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSection, setExpandedSection] = useState<EventSection | null>(
    null,
  );

  const [showLimit, setShowLimit] = useState(5);

  const filters = useLocalSearchParams<{
    date?: string;
    customDate?: string;
    customTime?: string;
    location?: string;
    maxPrice?: string;
    timeOfDay?: string;
  }>();

  const [role, setRole] = useState<"user" | "admin" | null>(null);

  useEffect(() => {
    fetchEvents();
    fetchRole();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("id", {
        ascending: false,
      });

    if (!error) setEvents(data);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  const fetchRole = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;

    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    setRole(data?.role);
  };

  const eventHasSection = (event: any, section: EventSection) => {
    const sectionText = [
      event?.category,
      event?.status,
      event?.type,
      event?.section,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return sectionText.includes(section);
  };

  const filterBySection = (section: EventSection) => {
    const matched = events.filter((event) => eventHasSection(event, section));
    return matched.length ? matched : events;
  };

  const getText = (value: unknown) =>
    typeof value === "string" ? value.toLowerCase() : "";

  const isSameDate = (left: Date, right: Date) =>
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate();

  const parseCustomDateParam = (value: string) => {
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return null;

    return new Date(year, month - 1, day);
  };

  const parseEventTime = (value: unknown) => {
    if (typeof value !== "string") return null;

    const match = value
      .trim()
      .match(/^(\d{1,2})(?::(\d{2}))?(?::\d{2})?\s*(AM|PM)?$/i);

    if (!match) return null;

    let hours = Number(match[1]);
    const minutes = Number(match[2] ?? 0);
    const meridiem = match[3]?.toUpperCase();

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes) ||
      hours > 23 ||
      minutes > 59
    ) {
      return null;
    }

    if (meridiem === "PM" && hours < 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;

    return { hours, minutes };
  };

  const matchesDateFilter = (eventDate: unknown) => {
    if (!filters.date && !filters.customDate) return true;
    const parsedDate = new Date(String(eventDate));
    if (Number.isNaN(parsedDate.getTime())) return true;

    if (filters.customDate) {
      const selected = parseCustomDateParam(filters.customDate);

      if (!selected) return true;

      return (
        parsedDate.getFullYear() === selected.getFullYear() &&
        parsedDate.getMonth() === selected.getMonth() &&
        parsedDate.getDate() === selected.getDate()
      );
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (filters.date === "today") {
      return isSameDate(parsedDate, today);
    }

    if (filters.date === "tomorrow") {
      return isSameDate(parsedDate, tomorrow);
    }

    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + 7);
    return parsedDate >= today && parsedDate <= weekEnd;
  };

  const matchesAppliedFilters = (event: any) => {
    const maxPrice = Number(filters.maxPrice);
    const price = Number(event?.price ?? event?.ticket_price ?? 0);
    const eventLocation = getText(event?.location);
    const eventTime = getText(event?.time_of_day ?? event?.timeOfDay);

    const matchesLocation =
      !filters.location ||
      eventLocation.includes(filters.location.toLowerCase());

    const matchesPrice =
      !filters.maxPrice || Number.isNaN(maxPrice) || price <= maxPrice;

    const matchesTime =
      !filters.timeOfDay ||
      filters.timeOfDay === "custom" ||
      !eventTime ||
      eventTime === filters.timeOfDay;

    const matchesSelectedTime = () => {
      if (!filters.customTime) return true;

      const selectedTime = parseEventTime(filters.customTime);

      if (!selectedTime || !event?.time) return true;

      const eventTime = parseEventTime(event.time);

      if (!eventTime) return true;

      return (
        eventTime.hours === selectedTime.hours &&
        eventTime.minutes === selectedTime.minutes
      );
    };

    return (
      matchesLocation &&
      matchesPrice &&
      matchesDateFilter(event?.date) &&
      matchesTime &&
      matchesSelectedTime()
    );
  };

  const filterEvents = (section?: EventSection) => {
    const source = section ? filterBySection(section) : events;

    return source.filter(
      (event) =>
        event?.name?.toLowerCase().includes(search.toLowerCase()) &&
        matchesAppliedFilters(event),
    );
  };

  const popularEvents = filterEvents("popular");
  const runningEvents = filterEvents("running");
  const expandedEvents = expandedSection
    ? filterEvents(expandedSection).slice(0, showLimit)
    : [];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Sidebar
          visible={menuOpen}
          onClose={() => setMenuOpen(false)}
          role={role ?? "user"}
        />

        {/* BACKGROUND */}
        <View style={styles.circleLeft} />

        <View style={styles.circleRight} />

        {/* HEADER */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => setMenuOpen((prev) => !prev)}>
            <Ionicons name="menu" size={28} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.logo}>GatherHub</Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onRefresh}
            style={styles.refreshButton}
          >
            <Ionicons name="refresh" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* HERO */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            Find The
            {"\n"}
            Trending Event
          </Text>

          <Text style={styles.subtitle}>
            Join exciting events and explore communities around you.
          </Text>
        </View>

        {/* SEARCH */}
        <View style={styles.searchWrapper}>
          <LinearGradient
            colors={["#B7EBDD", "#6EC2A6"]}
            style={styles.searchBar}
          >
            <Ionicons name="search-outline" size={20} color="#fff" />

            <TextInput
              placeholder="Search events..."
              placeholderTextColor="rgba(255,255,255,0.8)"
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />

            <TouchableOpacity
              onPress={() => router.push("/page/filter")}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#F7C2A7", "#E39170"]}
                style={styles.filterIcon}
              >
                <Ionicons name="options-outline" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* EXPANDED */}
        {expandedSection ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {expandedSection === "popular"
                  ? "All Popular Events"
                  : "All Running Events"}
              </Text>

              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setExpandedSection(null)}
              >
                <Ionicons name="chevron-back" size={16} color="#fff" />

                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
            </View>

            {/* LIMIT */}
            <View style={styles.limitRow}>
              <Text style={styles.limitTitle}>Show:</Text>

              {[5, 10, 25].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.limitButton,
                    showLimit === item && {
                      backgroundColor: "#A9E5BC",
                    },
                  ]}
                  onPress={() => setShowLimit(item)}
                >
                  <Text
                    style={[
                      styles.limitText,
                      showLimit === item && {
                        color: "#163525",
                      },
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.grid}>
              {expandedEvents.map((item) => (
                <EventCard key={item.id} event={item} />
              ))}

              {expandedEvents.length === 0 && (
                <Text style={styles.emptyText}>No events found</Text>
              )}
            </View>
          </View>
        ) : (
          <>
            {/* POPULAR */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Popular Events</Text>

                <TouchableOpacity onPress={() => setExpandedSection("popular")}>
                  <Text style={styles.seeAll}>see all</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={popularEvents.slice(0, 5)}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.list}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <EventCard event={item} />}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No popular events found</Text>
                }
              />
            </View>

            {/* RUNNING */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Running Events</Text>

                <TouchableOpacity onPress={() => setExpandedSection("running")}>
                  <Text style={styles.seeAll}>see all</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={runningEvents.slice(0, 5)}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.list}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <EventCard event={item} />}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No running events found</Text>
                }
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#2F6B4F",
  },

  container: {
    flex: 1,
    backgroundColor: "#2F6B4F",
  },

  scrollContainer: {
    paddingBottom: 40,
  },

  topBar: {
    marginTop: 10,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 999,
  },

  logo: {
    fontSize: width * 0.08,
    fontWeight: "bold",
    color: "#fff",
  },

  refreshButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },

  hero: {
    marginTop: 40,
    paddingHorizontal: 24,
  },

  heroTitle: {
    color: "#fff",
    fontSize: width * 0.1,
    fontWeight: "bold",
    lineHeight: 48,
  },

  subtitle: {
    color: "#E0E0E0",
    fontSize: 15,
    marginTop: 14,
    lineHeight: 24,
    width: "90%",
  },

  searchWrapper: {
    width: "100%",
    paddingHorizontal: 24,
    marginTop: 30,
    marginBottom: 10,
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    height: 58,
    paddingHorizontal: 18,
  },

  searchInput: {
    flex: 1,
    marginHorizontal: 12,
    color: "#fff",
    fontSize: 15,
  },

  filterIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },

  section: {
    marginTop: 25,
  },

  sectionHeader: {
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  sectionTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },

  seeAll: {
    color: "#DDF0E6",
    fontWeight: "600",
    fontSize: 13,
  },

  list: {
    paddingLeft: 24,
    paddingRight: 10,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 14,
    paddingHorizontal: 12,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },

  backText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 3,
  },

  emptyText: {
    color: "#DDF0E6",
    fontSize: 14,
    marginTop: 15,
    textAlign: "center",
  },

  limitRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 18,
  },

  limitTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    marginRight: 12,
  },

  limitButton: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    marginRight: 10,
  },

  limitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  circleLeft: {
    position: "absolute",
    width: 350,
    height: 350,
    borderRadius: 999,
    backgroundColor: "#F16A5B",
    top: -120,
    left: -120,
  },

  circleRight: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: "#E5C9A8",
    top: -80,
    right: -100,
    opacity: 0.9,
  },
});
