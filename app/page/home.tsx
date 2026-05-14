import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import EventCard from "../components/EventCard";
import Sidebar from "../components/Sidebar";
import { supabase } from "../services/api";

type EventSection = "popular" | "running";

export default function Home() {
  const [events, setEvents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<EventSection | null>(
    null,
  );
  const filters = useLocalSearchParams<{
    date?: string;
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
    const { data, error } = await supabase.from("events").select("*");
    if (!error) setEvents(data);
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

  const matchesDateFilter = (eventDate: unknown) => {
    if (!filters.date || filters.date === "custom") return true;

    const parsedDate = new Date(String(eventDate));
    if (Number.isNaN(parsedDate.getTime())) return true;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (filters.date === "today") return isSameDate(parsedDate, today);
    if (filters.date === "tomorrow") return isSameDate(parsedDate, tomorrow);

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
      filters.location === "current" ||
      eventLocation.includes(filters.location.toLowerCase());

    const matchesPrice =
      !filters.maxPrice || Number.isNaN(maxPrice) || price <= maxPrice;

    const matchesTime =
      !filters.timeOfDay || !eventTime || eventTime === filters.timeOfDay;

    return (
      matchesLocation &&
      matchesPrice &&
      matchesDateFilter(event?.date) &&
      matchesTime
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
  const expandedEvents = expandedSection ? filterEvents(expandedSection) : [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={true}
      bounces={false}
      overScrollMode="never"
    >
      <Sidebar
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        role={role ?? "user"}
      />

      <View style={styles.circleLeft} />
      <View style={styles.circleRight} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setMenuOpen((prev) => !prev)}>
          <Ionicons name="menu" size={26} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.logo}>GatherHub</Text>

        <Ionicons name="notifications" size={20} color="#fff" />
      </View>

      <View style={styles.scrollContent}>
        <Text style={styles.subtitle}>Find the trending event</Text>

        <View style={styles.searchWrapper}>
          <LinearGradient
            colors={["#B7EBDD", "#6EC2A6"]}
            style={styles.searchBar}
          >
            <Ionicons name="search-outline" size={18} color="#fff" />

            <TextInput
              placeholder="Search events"
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
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.filterIcon}
              >
                <Ionicons name="options-outline" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {expandedSection ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {expandedSection === "popular"
                  ? "All popular events"
                  : "All running events"}
              </Text>

              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setExpandedSection(null)}
                activeOpacity={0.8}
              >
                <Ionicons name="chevron-back" size={16} color="#fff" />
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
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
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Popular events</Text>
                <TouchableOpacity onPress={() => setExpandedSection("popular")}>
                  <Text style={styles.seeAll}>see all</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={popularEvents}
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

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Running events</Text>
                <TouchableOpacity onPress={() => setExpandedSection("running")}>
                  <Text style={styles.seeAll}>see all</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={runningEvents}
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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2F6B4F",
  },

  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#2F6B4F",
    paddingBottom: 40,
  },

  scrollContent: {
    alignItems: "center",
  },

  topBar: {
    marginTop: 50,
    marginHorizontal: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 999,
  },

  logo: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
  },

  subtitle: {
    color: "#E0E0E0",
    fontSize: 25,
    marginTop: 50,
    marginBottom: 25,
    textAlign: "center",
  },

  searchWrapper: {
    width: "75%",
    marginBottom: 20,
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 30,
    height: 45,
    paddingHorizontal: 15,
  },

  searchInput: {
    flex: 1,
    marginHorizontal: 10,
    color: "#fff",
    fontSize: 13,
  },

  filterIcon: {
    width: 35,
    height: 35,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },

  section: {
    width: "90%",
    marginTop: 10,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  sectionTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  seeAll: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },

  list: {
    paddingLeft: 5,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },

  backText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  emptyText: {
    color: "#DDF0E6",
    fontSize: 13,
    marginVertical: 14,
  },

  circleLeft: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: 300,
    backgroundColor: "#F16A5B",
    top: -80,
    left: -80,
  },

  circleRight: {
    position: "absolute",
    width: 330,
    height: 350,
    borderRadius: 240,
    backgroundColor: "#E5C9A8",
    top: -80,
    right: -80,
  },
});
