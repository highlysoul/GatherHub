import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import {
  Dimensions,
  FlatList,
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

type EventSection =
  | "popular"
  | "running";

const { width } =
  Dimensions.get("window");

export default function Home() {
  const [events, setEvents] =
    useState<any[]>([]);

  const [search, setSearch] =
    useState("");

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [
    expandedSection,
    setExpandedSection,
  ] = useState<EventSection | null>(
    null
  );

  const filters =
    useLocalSearchParams<{
      date?: string;
      location?: string;
      maxPrice?: string;
      timeOfDay?: string;
    }>();

  const [role, setRole] =
    useState<
      "user" | "admin" | null
    >(null);

  useEffect(() => {
    fetchEvents();
    fetchRole();
  }, []);

  const fetchEvents =
    async () => {
      const {
        data,
        error,
      } = await supabase
        .from("events")
        .select("*");

      if (!error)
        setEvents(data);
    };

  const fetchRole =
    async () => {
      const {
        data: userData,
      } =
        await supabase.auth.getUser();

      const userId =
        userData?.user?.id;

      if (!userId) return;

      const { data } =
        await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .single();

      setRole(data?.role);
    };

  const eventHasSection = (
    event: any,
    section: EventSection
  ) => {
    const sectionText = [
      event?.category,
      event?.status,
      event?.type,
      event?.section,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return sectionText.includes(
      section
    );
  };

  const filterBySection = (
    section: EventSection
  ) => {
    const matched =
      events.filter((event) =>
        eventHasSection(
          event,
          section
        )
      );

    return matched.length
      ? matched
      : events;
  };

  const getText = (
    value: unknown
  ) =>
    typeof value === "string"
      ? value.toLowerCase()
      : "";

  const isSameDate = (
    left: Date,
    right: Date
  ) =>
    left.getFullYear() ===
      right.getFullYear() &&
    left.getMonth() ===
      right.getMonth() &&
    left.getDate() ===
      right.getDate();

  const matchesDateFilter = (
    eventDate: unknown
  ) => {
    if (
      !filters.date ||
      filters.date === "custom"
    )
      return true;

    const parsedDate =
      new Date(String(eventDate));

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    )
      return true;

    const today = new Date();

    const tomorrow =
      new Date(today);

    tomorrow.setDate(
      today.getDate() + 1
    );

    if (
      filters.date === "today"
    )
      return isSameDate(
        parsedDate,
        today
      );

    if (
      filters.date ===
      "tomorrow"
    )
      return isSameDate(
        parsedDate,
        tomorrow
      );

    const weekEnd =
      new Date(today);

    weekEnd.setDate(
      today.getDate() + 7
    );

    return (
      parsedDate >= today &&
      parsedDate <= weekEnd
    );
  };

  const matchesAppliedFilters =
    (event: any) => {
      const maxPrice = Number(
        filters.maxPrice
      );

      const price = Number(
        event?.price ??
          event?.ticket_price ??
          0
      );

      const eventLocation =
        getText(
          event?.location
        );

      const eventTime =
        getText(
          event?.time_of_day ??
            event?.timeOfDay
        );

      const matchesLocation =
        !filters.location ||
        filters.location ===
          "current" ||
        eventLocation.includes(
          filters.location.toLowerCase()
        );

      const matchesPrice =
        !filters.maxPrice ||
        Number.isNaN(maxPrice) ||
        price <= maxPrice;

      const matchesTime =
        !filters.timeOfDay ||
        !eventTime ||
        eventTime ===
          filters.timeOfDay;

      return (
        matchesLocation &&
        matchesPrice &&
        matchesDateFilter(
          event?.date
        ) &&
        matchesTime
      );
    };

  const filterEvents = (
    section?: EventSection
  ) => {
    const source = section
      ? filterBySection(section)
      : events;

    return source.filter(
      (event) =>
        event?.name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) &&
        matchesAppliedFilters(
          event
        )
    );
  };

  const popularEvents =
    filterEvents("popular");

  const runningEvents =
    filterEvents("running");

  const expandedEvents =
    expandedSection
      ? filterEvents(
          expandedSection
        )
      : [];

  return (
    <SafeAreaView
      style={styles.safe}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.scrollContainer
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <Sidebar
          visible={menuOpen}
          onClose={() =>
            setMenuOpen(false)
          }
          role={role ?? "user"}
        />

        {/* BACKGROUND */}
        <View
          style={
            styles.circleLeft
          }
        />

        <View
          style={
            styles.circleRight
          }
        />

        {/* HEADER */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() =>
              setMenuOpen(
                (prev) => !prev
              )
            }
          >
            <Ionicons
              name="menu"
              size={28}
              color="#fff"
            />
          </TouchableOpacity>

          <Text style={styles.logo}>
            GatherHub
          </Text>

          <TouchableOpacity>
            <Ionicons
              name="notifications"
              size={23}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        {/* HERO */}
        <View style={styles.hero}>
          <Text
            style={
              styles.heroTitle
            }
          >
            Discover Amazing
            {"\n"}
            Events Near You
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Find trending events,
            communities, and
            experiences.
          </Text>
        </View>

        {/* SEARCH */}
        <View
          style={
            styles.searchWrapper
          }
        >
          <LinearGradient
            colors={[
              "#B7EBDD",
              "#6EC2A6",
            ]}
            style={
              styles.searchBar
            }
          >
            <Ionicons
              name="search-outline"
              size={20}
              color="#fff"
            />

            <TextInput
              placeholder="Search events..."
              placeholderTextColor="rgba(255,255,255,0.8)"
              value={search}
              onChangeText={
                setSearch
              }
              style={
                styles.searchInput
              }
            />

            <TouchableOpacity
              onPress={() =>
                router.push(
                  "/page/filter"
                )
              }
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[
                  "#F7C2A7",
                  "#E39170",
                ]}
                style={
                  styles.filterIcon
                }
              >
                <Ionicons
                  name="options-outline"
                  size={20}
                  color="#fff"
                />
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* EXPANDED */}
        {expandedSection ? (
          <View
            style={
              styles.section
            }
          >
            <View
              style={
                styles.sectionHeader
              }
            >
              <Text
                style={
                  styles.sectionTitle
                }
              >
                {expandedSection ===
                "popular"
                  ? "All Popular Events"
                  : "All Running Events"}
              </Text>

              <TouchableOpacity
                style={
                  styles.backButton
                }
                onPress={() =>
                  setExpandedSection(
                    null
                  )
                }
              >
                <Ionicons
                  name="chevron-back"
                  size={16}
                  color="#fff"
                />

                <Text
                  style={
                    styles.backText
                  }
                >
                  Back
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={styles.grid}
            >
              {expandedEvents.map(
                (item) => (
                  <EventCard
                    key={item.id}
                    event={item}
                  />
                )
              )}

              {expandedEvents.length ===
                0 && (
                <Text
                  style={
                    styles.emptyText
                  }
                >
                  No events found
                </Text>
              )}
            </View>
          </View>
        ) : (
          <>
            {/* POPULAR */}
            <View
              style={
                styles.section
              }
            >
              <View
                style={
                  styles.sectionHeader
                }
              >
                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Popular Events
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    setExpandedSection(
                      "popular"
                    )
                  }
                >
                  <Text
                    style={
                      styles.seeAll
                    }
                  >
                    see all
                  </Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={
                  popularEvents
                }
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.list
                }
                keyExtractor={(
                  item
                ) =>
                  item.id.toString()
                }
                renderItem={({
                  item,
                }) => (
                  <EventCard
                    event={item}
                  />
                )}
                ListEmptyComponent={
                  <Text
                    style={
                      styles.emptyText
                    }
                  >
                    No popular events
                    found
                  </Text>
                }
              />
            </View>

            {/* RUNNING */}
            <View
              style={
                styles.section
              }
            >
              <View
                style={
                  styles.sectionHeader
                }
              >
                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Running Events
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    setExpandedSection(
                      "running"
                    )
                  }
                >
                  <Text
                    style={
                      styles.seeAll
                    }
                  >
                    see all
                  </Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={
                  runningEvents
                }
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.list
                }
                keyExtractor={(
                  item
                ) =>
                  item.id.toString()
                }
                renderItem={({
                  item,
                }) => (
                  <EventCard
                    event={item}
                  />
                )}
                ListEmptyComponent={
                  <Text
                    style={
                      styles.emptyText
                    }
                  >
                    No running events
                    found
                  </Text>
                }
              />
            </View>
          </>
        )}
      </ScrollView>
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

    container: {
      flex: 1,
      backgroundColor:
        "#2F6B4F",
    },

    scrollContainer: {
      paddingBottom: 40,
    },

    topBar: {
      marginTop: 10,
      paddingHorizontal: 22,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      zIndex: 999,
    },

    logo: {
      fontSize: width * 0.08,
      fontWeight: "bold",
      color: "#fff",
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
      justifyContent:
        "space-between",
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
      backgroundColor:
        "rgba(255,255,255,0.15)",
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

    circleLeft: {
      position: "absolute",
      width: 350,
      height: 350,
      borderRadius: 999,
      backgroundColor:
        "#F16A5B",
      top: -120,
      left: -120,
    },

    circleRight: {
      position: "absolute",
      width: 260,
      height: 260,
      borderRadius: 999,
      backgroundColor:
        "#E5C9A8",
      top: -80,
      right: -100,
      opacity: 0.9,
    },
  });