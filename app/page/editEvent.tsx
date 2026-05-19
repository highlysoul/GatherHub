import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import {
    router,
    useLocalSearchParams,
} from "expo-router";

import React, {
    useEffect,
    useState,
} from "react";

import {
    ActivityIndicator,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import MapView, {
    Marker,
} from "react-native-maps";

import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "../services/api";

export default function EditEvent() {
  const { id } =
    useLocalSearchParams();

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [eventName, setEventName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [quota, setQuota] =
    useState("");

  const [locationName, setLocationName] =
    useState("");

  const [manualLocation, setManualLocation] =
    useState("");

  const [image, setImage] =
    useState<string | null>(null);

  const [date, setDate] =
    useState(new Date());

  const [showDatePicker, setShowDatePicker] =
    useState(false);

  const [showTimePicker, setShowTimePicker] =
    useState(false);

  const [showImagePicker, setShowImagePicker] =
    useState(false);

  const [showSaveModal, setShowSaveModal] =
    useState(false);

  const [showSuccessModal, setShowSuccessModal] =
    useState(false);

  const [showDiscardModal, setShowDiscardModal] =
    useState(false);

  const [region, setRegion] =
    useState({
      latitude:
        -6.302481,
      longitude:
        106.652222,
      latitudeDelta:
        0.005,
      longitudeDelta:
        0.005,
    });

  useEffect(() => {
    fetchEvent();
  }, []);

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

        if (!error && data) {
          setEventName(
            data.name
          );

          setDescription(
            data.description
          );

          setQuota(
            String(
              data.quota
            )
          );

          setLocationName(
            data.location
          );

          setManualLocation(
            data.location
          );

          setImage(
            data.image
          );

          setDate(
            new Date()
          );

          setRegion({
            latitude:
              data.latitude ||
              -6.302481,

            longitude:
              data.longitude ||
              106.652222,

            latitudeDelta:
              0.005,

            longitudeDelta:
              0.005,
          });
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

  const pickImage =
    async () => {
      setShowImagePicker(
        true
      );
    };

  const uploadImage =
    async (
      uri: string
    ) => {
      const response =
        await fetch(uri);

      const blob =
        await response.blob();

      const fileName = `event-${Date.now()}.jpg`;

      const {
        error,
      } = await supabase.storage
        .from(
          "event-images"
        )
        .upload(
          fileName,
          blob,
          {
            contentType:
              "image/jpeg",
          }
        );

      if (error) {
        console.log(error);

        return null;
      }

      const {
        data,
      } = supabase.storage
        .from(
          "event-images"
        )
        .getPublicUrl(
          fileName
        );

      return data.publicUrl;
    };

  const handleUpdate =
    async () => {
      try {
        setSaving(true);

        let imageUrl =
          image;

        if (
          image &&
          !image.startsWith(
            "http"
          )
        ) {
          const uploadedImage =
            await uploadImage(
              image
            );

          if (
            uploadedImage
          ) {
            imageUrl =
              uploadedImage;
          }
        }

        const finalLocation =
          manualLocation.trim() ||
          locationName;

        const {
          error,
        } =
          await supabase
            .from(
              "events"
            )
            .update({
              name:
                eventName,

              description,

              quota:
                Number(
                  quota
                ),

              image:
                imageUrl,

              location:
                finalLocation,

              latitude:
                region.latitude,

              longitude:
                region.longitude,

              date:
                date.toDateString(),

              time:
                date.toLocaleTimeString(),
            })
            .eq(
              "id",
              id
            );

        if (!error) {
          setShowSaveModal(
            false
          );

          setShowSuccessModal(
            true
          );
        }
      } catch (error) {
        console.log(error);
      } finally {
        setSaving(false);
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
          color="#2F6B4F"
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
        style={
          styles.container
        }
        showsVerticalScrollIndicator={
          false
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

          <TouchableOpacity
            style={
              styles.backButton
            }
            onPress={() =>
              setShowDiscardModal(
                true
              )
            }
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color="#163525"
            />
          </TouchableOpacity>

          <Text
            style={styles.title}
          >
            Edit Event
          </Text>

          {/* IMAGE */}
          <TouchableOpacity
            activeOpacity={
              0.8
            }
            onPress={
              pickImage
            }
          >
            {image ? (
              <Image
                source={{
                  uri: image,
                }}
                style={
                  styles.banner
                }
              />
            ) : (
              <View
                style={
                  styles.bannerPlaceholder
                }
              >
                <Ionicons
                  name="image"
                  size={70}
                  color="#fff"
                />

                <Text
                  style={
                    styles.uploadText
                  }
                >
                  Upload Event Banner
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </LinearGradient>

        {/* FORM */}
        <View
          style={styles.form}
        >
          {/* TITLE */}
          <Text
            style={styles.label}
          >
            Event Title
          </Text>

          <TextInput
            style={styles.input}
            value={
              eventName
            }
            onChangeText={
              setEventName
            }
            placeholder="Business Meetup"
            placeholderTextColor="#9ca3af"
          />

          {/* DATE TIME */}
          <View
            style={styles.row}
          >
            <TouchableOpacity
              style={
                styles.dateButton
              }
              onPress={() =>
                setShowDatePicker(
                  true
                )
              }
            >
              <Ionicons
                name="calendar"
                size={20}
                color="#3FA16F"
              />

              <Text
                style={
                  styles.dateText
                }
              >
                {date.toDateString()}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.dateButton
              }
              onPress={() =>
                setShowTimePicker(
                  true
                )
              }
            >
              <Ionicons
                name="time"
                size={20}
                color="#3FA16F"
              />

              <Text
                style={
                  styles.dateText
                }
              >
                {date.toLocaleTimeString()}
              </Text>
            </TouchableOpacity>
          </View>

          {/* MAP */}
          <Text
            style={styles.label}
          >
            Pick From Map
          </Text>

          <View
            style={{
              borderRadius: 24,
              overflow:
                "hidden",
              marginBottom: 16,
              backgroundColor:
                "#fff",
            }}
          >
            <MapView
              style={
                styles.map
              }
              region={region}
              showsUserLocation
              showsMyLocationButton
              onRegionChangeComplete={async (
                newRegion
              ) => {
                setRegion(
                  newRegion
                );

                const address =
                  await Location.reverseGeocodeAsync(
                    {
                      latitude:
                        newRegion.latitude,

                      longitude:
                        newRegion.longitude,
                    }
                  );

                if (
                  address.length >
                  0
                ) {
                  const place =
                    address[0];

                  const locationText =
                    [
                      place.name,
                      place.street,
                      place.district,
                      place.city,
                      place.region,
                      place.country,
                    ]
                      .filter(
                        Boolean
                      )
                      .join(
                        ", "
                      );

                  setLocationName(
                    locationText
                  );
                }
              }}
            >
              <Marker
                coordinate={{
                  latitude:
                    region.latitude,

                  longitude:
                    region.longitude,
                }}
              />
            </MapView>

            {/* CENTER PIN */}
            <View
              pointerEvents="none"
              style={{
                position:
                  "absolute",
                top: "50%",
                left: "50%",
                marginLeft:
                  -20,
                marginTop:
                  -40,
              }}
            >
              <Ionicons
                name="location"
                size={42}
                color="#E53935"
              />
            </View>
          </View>

          {/* LOCATION */}
          <Text
            style={styles.label}
          >
            Location Result
          </Text>

          <View
            style={
              styles.locationBox
            }
          >
            <Text
              style={
                styles.locationValue
              }
            >
              {locationName}
            </Text>
          </View>

          {/* MANUAL */}
          <Text
            style={styles.label}
          >
            Or Type Location
          </Text>

          <TextInput
            style={styles.input}
            value={
              manualLocation
            }
            onChangeText={
              setManualLocation
            }
            placeholder="ICE BSD, Tangerang"
            placeholderTextColor="#9ca3af"
          />

          {/* QUOTA */}
          <Text
            style={styles.label}
          >
            Participant Quota
          </Text>

          <TextInput
            style={styles.input}
            value={quota}
            keyboardType="numeric"
            onChangeText={
              setQuota
            }
            placeholder="100"
            placeholderTextColor="#9ca3af"
          />

          {/* DESCRIPTION */}
          <Text
            style={styles.label}
          >
            Description
          </Text>

          <TextInput
            multiline
            style={
              styles.descriptionInput
            }
            value={
              description
            }
            onChangeText={
              setDescription
            }
            placeholder="Write something..."
            placeholderTextColor="#9ca3af"
          />

          {/* BUTTON */}
          <TouchableOpacity
            activeOpacity={
              0.85
            }
            onPress={() =>
              setShowSaveModal(
                true
              )
            }
          >
            <LinearGradient
              colors={[
                "#A9E5BC",
                "#3FA16F",
              ]}
              style={
                styles.saveButton
              }
            >
              <Text
                style={
                  styles.saveText
                }
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* DATE PICKER */}
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            onChange={(
              _,
              selectedDate
            ) => {
              setShowDatePicker(
                false
              );

              if (
                selectedDate
              ) {
                setDate(
                  selectedDate
                );
              }
            }}
          />
        )}

        {/* TIME PICKER */}
        {showTimePicker && (
          <DateTimePicker
            value={date}
            mode="time"
            onChange={(
              _,
              selectedTime
            ) => {
              setShowTimePicker(
                false
              );

              if (
                selectedTime
              ) {
                setDate(
                  selectedTime
                );
              }
            }}
          />
        )}
      </ScrollView>

      {/* IMAGE PICKER */}
      <Modal
        transparent
        visible={
          showImagePicker
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
            <Text
              style={
                styles.modalTitle
              }
            >
              Choose Image
            </Text>

            {/* CAMERA */}
            <TouchableOpacity
              style={
                styles.modalOption
              }
              onPress={async () => {
                setShowImagePicker(
                  false
                );

                const result =
                  await ImagePicker.launchCameraAsync(
                    {
                      allowsEditing: true,
                      quality: 0.8,
                    }
                  );

                if (
                  !result.canceled
                ) {
                  setImage(
                    result
                      .assets[0]
                      .uri
                  );
                }
              }}
            >
              <Ionicons
                name="camera"
                size={22}
                color="#3FA16F"
              />

              <Text
                style={
                  styles.modalOptionText
                }
              >
                Open Camera
              </Text>
            </TouchableOpacity>

            {/* GALLERY */}
            <TouchableOpacity
              style={
                styles.modalOption
              }
              onPress={async () => {
                setShowImagePicker(
                  false
                );

                const result =
                  await ImagePicker.launchImageLibraryAsync(
                    {
                      mediaTypes:
                        ["images"],
                      allowsEditing: true,
                      quality: 0.8,
                    }
                  );

                if (
                  !result.canceled
                ) {
                  setImage(
                    result
                      .assets[0]
                      .uri
                  );
                }
              }}
            >
              <Ionicons
                name="images"
                size={22}
                color="#3FA16F"
              />

              <Text
                style={
                  styles.modalOptionText
                }
              >
                Open Gallery
              </Text>
            </TouchableOpacity>

            {/* CANCEL */}
            <TouchableOpacity
              style={
                styles.cancelButton
              }
              onPress={() =>
                setShowImagePicker(
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
          </View>
        </View>
      </Modal>

      {/* SAVE MODAL */}
      <Modal
        transparent
        visible={
          showSaveModal
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
              styles.confirmModal
            }
          >
            <LinearGradient
              colors={[
                "#A9E5BC",
                "#3FA16F",
              ]}
              style={
                styles.iconCircle
              }
            >
              <Ionicons
                name="save"
                size={32}
                color="#fff"
              />
            </LinearGradient>

            <Text
              style={
                styles.confirmTitle
              }
            >
              Save Changes?
            </Text>

            <Text
              style={
                styles.confirmText
              }
            >
              Are you sure you want to update this event?
            </Text>

            <View
              style={
                styles.confirmRow
              }
            >
              <TouchableOpacity
                style={
                  styles.cancelAction
                }
                onPress={() =>
                  setShowSaveModal(
                    false
                  )
                }
              >
                <Text
                  style={
                    styles.cancelActionText
                  }
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={
                  handleUpdate
                }
              >
                <LinearGradient
                  colors={[
                    "#A9E5BC",
                    "#3FA16F",
                  ]}
                  style={
                    styles.confirmButton
                  }
                >
                  <Text
                    style={
                      styles.confirmButtonText
                    }
                  >
                    Save
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
              styles.confirmModal
            }
          >
            <LinearGradient
              colors={[
                "#75DFA8",
                "#2F9B68",
              ]}
              style={
                styles.iconCircle
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
                styles.confirmTitle
              }
            >
              Event Updated
            </Text>

            <Text
              style={
                styles.confirmText
              }
            >
              Your event has been updated successfully.
            </Text>

            <TouchableOpacity
              onPress={() => {
                setShowSuccessModal(
                  false
                );

                router.back();
              }}
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
                    styles.confirmButtonText
                  }
                >
                  OK
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* DISCARD MODAL */}
      <Modal
        transparent
        visible={
          showDiscardModal
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
              styles.confirmModal
            }
          >
            <LinearGradient
              colors={[
                "#FF826F",
                "#B93224",
              ]}
              style={
                styles.iconCircle
              }
            >
              <Ionicons
                name="warning"
                size={34}
                color="#fff"
              />
            </LinearGradient>

            <Text
              style={
                styles.confirmTitle
              }
            >
              Leave Page?
            </Text>

            <Text
              style={
                styles.confirmText
              }
            >
              Your changes may not be saved.
            </Text>

            <View
              style={
                styles.confirmRow
              }
            >
              <TouchableOpacity
                style={
                  styles.cancelAction
                }
                onPress={() =>
                  setShowDiscardModal(
                    false
                  )
                }
              >
                <Text
                  style={
                    styles.cancelActionText
                  }
                >
                  Stay
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  router.back()
                }
              >
                <LinearGradient
                  colors={[
                    "#FF826F",
                    "#B93224",
                  ]}
                  style={
                    styles.confirmButton
                  }
                >
                  <Text
                    style={
                      styles.confirmButtonText
                    }
                  >
                    Leave
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

    loadingContainer: {
      flex: 1,
      justifyContent:
        "center",
      alignItems: "center",
      backgroundColor:
        "#F3F4F6",
    },

    header: {
      paddingTop: 10,
      paddingBottom: 30,
      paddingHorizontal: 20,
      backgroundColor:
        "#2F6B4F",
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
      overflow: "hidden",
      alignItems: "center",
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

    backButton: {
      alignSelf:
        "flex-start",
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor:
        "rgba(255,255,255,0.75)",
      justifyContent:
        "center",
      alignItems:
        "center",
      marginBottom: 10,
    },

    title: {
      fontSize: 30,
      fontWeight: "bold",
      color: "#fff",
      marginBottom: 20,
    },

    banner: {
      width: 320,
      height: 210,
      borderRadius: 24,
    },

    bannerPlaceholder: {
      width: 320,
      height: 210,
      borderRadius: 24,
      backgroundColor:
        "#216D42",
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    uploadText: {
      marginTop: 10,
      color: "#fff",
      fontWeight: "600",
      fontSize: 15,
    },

    form: {
      padding: 20,
    },

    label: {
      fontSize: 15,
      fontWeight: "700",
      color: "#374151",
      marginBottom: 8,
      marginTop: 10,
    },

    input: {
      width: "100%",
      height: 54,
      backgroundColor:
        "#fff",
      borderRadius: 16,
      paddingHorizontal: 16,
      fontSize: 15,
      color: "#111827",
      marginBottom: 14,
    },

    row: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      marginBottom: 10,
    },

    dateButton: {
      width: "48%",
      height: 54,
      backgroundColor:
        "#fff",
      borderRadius: 16,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    dateText: {
      marginTop: 4,
      fontSize: 12,
      fontWeight: "600",
      color: "#374151",
    },

    map: {
      width: "100%",
      height: 270,
    },

    locationBox: {
      backgroundColor:
        "#fff",
      borderRadius: 18,
      paddingHorizontal: 18,
      paddingVertical: 18,
      marginBottom: 14,
    },

    locationValue: {
      fontSize: 14,
      color: "#111827",
      lineHeight: 24,
    },

    descriptionInput: {
      width: "100%",
      height: 130,
      backgroundColor:
        "#fff",
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingTop: 14,
      textAlignVertical:
        "top",
      fontSize: 15,
      color: "#111827",
    },

    saveButton: {
      marginTop: 28,
      height: 56,
      borderRadius: 999,
      justifyContent:
        "center",
      alignItems:
        "center",
      marginBottom: 30,
    },

    saveText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },

    modalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(0,0,0,0.45)",
      justifyContent:
        "center",
      alignItems:
        "center",
      paddingHorizontal: 20,
    },

    modalContainer: {
      width: 320,
      backgroundColor:
        "#296048",
      borderRadius: 24,
      padding: 24,
    },

    modalTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: "#fff",
      marginBottom: 14,
      textAlign: "center",
    },

    modalOption: {
      flexDirection: "row",
      alignItems:
        "center",
      backgroundColor:
        "#fff",
      padding: 16,
      borderRadius: 16,
      marginBottom: 14,
    },

    modalOptionText: {
      marginLeft: 12,
      fontSize: 15,
      fontWeight: "600",
      color: "#111827",
    },

    cancelButton: {
      marginTop: 4,
      alignItems:
        "center",
    },

    cancelText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "700",
    },

    confirmModal: {
      width: 340,
      backgroundColor:
        "#296048",
      borderRadius: 28,
      paddingVertical: 30,
      paddingHorizontal: 24,
      alignItems:
        "center",
    },

    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 999,
      justifyContent:
        "center",
      alignItems:
        "center",
      marginBottom: 18,
    },

    confirmTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: "#fff",
      marginBottom: 10,
    },

    confirmText: {
      fontSize: 14,
      color: "#D1FAE5",
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 24,
    },

    confirmRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    cancelAction: {
      width: 110,
      height: 45,
      borderRadius: 999,
      backgroundColor:
        "#E5E7EB",
      justifyContent:
        "center",
      alignItems:
        "center",
      marginRight: 12,
    },

    cancelActionText: {
      color: "#111827",
      fontSize: 15,
      fontWeight: "700",
    },

    confirmButton: {
      width: 110,
      height: 45,
      borderRadius: 999,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    confirmButtonText: {
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
      alignItems:
        "center",
    },
  });