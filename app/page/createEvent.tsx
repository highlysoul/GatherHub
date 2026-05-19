import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, {
  useEffect,
  useState,
} from "react";

import {
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

export default function CreateEvent() {
  const [eventName, setEventName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [locationName, setLocationName] =
    useState("");

  const [manualLocation, setManualLocation] =
    useState("");

  const [quota, setQuota] =
    useState("");

  const [image, setImage] =
    useState<string | null>(null);

  const [date, setDate] =
    useState(new Date());

  const [showDatePicker, setShowDatePicker] =
    useState(false);

  const [showTimePicker, setShowTimePicker] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [showImagePicker, setShowImagePicker] =
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

  // MODAL
  const [showModal, setShowModal] =
    useState(false);

  const [modalTitle, setModalTitle] =
    useState("");

  const [modalMessage, setModalMessage] =
    useState("");

  const [isSuccess, setIsSuccess] =
    useState(false);

  const [modalAction, setModalAction] =
    useState<(() => void) | null>(
      null
    );

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const showAlert = (
    title: string,
    message: string,
    success: boolean,
    action?: () => void
  ) => {
    setModalTitle(title);

    setModalMessage(message);

    setIsSuccess(success);

    setShowModal(true);

    setModalAction(
      () => action || null
    );
  };

  // CURRENT LOCATION
  const getCurrentLocation =
    async () => {
      try {
        const {
          status,
        } =
          await Location.requestForegroundPermissionsAsync();

        if (
          status !==
          "granted"
        ) {
          return;
        }

        const currentLocation =
          await Location.getCurrentPositionAsync(
            {
              accuracy:
                Location.Accuracy.Highest,
            }
          );

        const latitude =
          currentLocation.coords
            .latitude;

        const longitude =
          currentLocation.coords
            .longitude;

        const currentRegion =
          {
            latitude,
            longitude,
            latitudeDelta:
              0.005,
            longitudeDelta:
              0.005,
          };

        setRegion(
          currentRegion
        );

        const address =
          await Location.reverseGeocodeAsync(
            {
              latitude,
              longitude,
            }
          );

        if (
          address.length > 0
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
              .join(", ");

          setLocationName(
            locationText
          );
        }
      } catch (error) {
        console.log(error);
      }
    };

  const handleBack = () => {
    const hasChanges =
      eventName ||
      description ||
      locationName ||
      manualLocation ||
      image ||
      quota;

    if (hasChanges) {
      showAlert(
        "Discard Changes?",
        "You have unsaved changes.",
        false,
        () => router.back()
      );

      return;
    }

    router.back();
  };

  // IMAGE PICKER
  const pickImage = async () => {
    const cameraPermission =
      await ImagePicker.requestCameraPermissionsAsync();

    const galleryPermission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (
      !cameraPermission.granted ||
      !galleryPermission.granted
    ) {
      showAlert(
        "Permission Needed",
        "Please allow camera and gallery access.",
        false
      );

      return;
    }

    setShowImagePicker(true);
  };

  const finalLocation =
    manualLocation.trim() ||
    locationName;

  // CREATE EVENT
  const handleCreateEvent =
    async () => {
      if (
        !eventName.trim() ||
        !description.trim() ||
        !finalLocation.trim() ||
        !quota.trim()
      ) {
        showAlert(
          "Create Event Failed",
          "Please complete all fields.",
          false
        );

        return;
      }

      try {
        setLoading(true);

        const {
          data: { user },
        } =
          await supabase.auth.getUser();

        if (!user) return;

        const {
          data: profileData,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) {
          showAlert(
            "Profile Error",
            profileError.message,
            false
          );

          return;
        }

        let imageUrl = null;

        // UPLOAD IMAGE
        if (image) {
          const response =
            await fetch(image);

          const arrayBuffer =
            await response.arrayBuffer();

          const fileExt =
            image
              .split(".")
              .pop();

          const fileName = `${Date.now()}.${fileExt}`;

          const filePath = `events/${fileName}`;

          const {
            error:
              uploadError,
          } =
            await supabase.storage
              .from(
                "event-images"
              )
              .upload(
                filePath,
                arrayBuffer,
                {
                  contentType:
                    "image/jpeg",
                }
              );

          if (
            uploadError
          ) {
            showAlert(
              "Upload Failed",
              uploadError.message,
              false
            );

            return;
          }

          const { data } =
            supabase.storage
              .from(
                "event-images"
              )
              .getPublicUrl(
                filePath
              );

          imageUrl =
            data.publicUrl;
        }

        // INSERT EVENT
        const { error } =
          await supabase
            .from("events")
            .insert({
              name:
                eventName,

              description,

              quota:
                Number(
                  quota
                ),

              participants_count: 0,

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

              created_by:
                user.id,

              created_by_name:
                profileData?.full_name,

              created_by_photo:
                profileData?.photo,
            });

        if (error) {
          showAlert(
            "Create Failed",
            error.message,
            false
          );

          return;
        }

        showAlert(
          "Event Created",
          "Your event has been created successfully.",
          true,
          () => router.back()
        );
      } catch (error) {
        console.log(error);

        showAlert(
          "Error",
          "Something went wrong.",
          false
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <SafeAreaView
      style={styles.safe}
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
            onPress={
              handleBack
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
            Create Event
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
            placeholder="Business Meetup"
            placeholderTextColor="#9ca3af"
            value={
              eventName
            }
            onChangeText={
              setEventName
            }
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

          {/* LOCATION RESULT */}
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
              {locationName ||
                "Move map to select location"}
            </Text>
          </View>

          {/* MANUAL LOCATION */}
          <Text
            style={styles.label}
          >
            Or Type Location
          </Text>

          <TextInput
            style={styles.input}
            placeholder="ICE BSD, Tangerang"
            placeholderTextColor="#9ca3af"
            value={
              manualLocation
            }
            onChangeText={
              setManualLocation
            }
          />

          {/* QUOTA */}
          <Text
            style={styles.label}
          >
            Participant Quota
          </Text>

          <TextInput
            style={styles.input}
            placeholder="100"
            placeholderTextColor="#9ca3af"
            value={quota}
            keyboardType="numeric"
            onChangeText={
              setQuota
            }
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
            placeholder="Write something about your event..."
            placeholderTextColor="#9ca3af"
            value={
              description
            }
            onChangeText={
              setDescription
            }
          />

          {/* BUTTON */}
          <TouchableOpacity
            activeOpacity={
              0.8
            }
            onPress={
              handleCreateEvent
            }
          >
            <LinearGradient
              colors={[
                "#A9E5BC",
                "#3FA16F",
              ]}
              style={
                styles.createButton
              }
            >
              <Text
                style={
                  styles.buttonText
                }
              >
                {loading
                  ? "Creating..."
                  : "Create Event"}
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

      {/* IMAGE PICKER MODAL */}
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
              styles.imagePickerContainer
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
                styles.imageOption
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

                  showAlert(
                    "Image Selected",
                    "Photo taken successfully.",
                    true
                  );
                }
              }}
            >
              <Ionicons
                name="camera"
                size={24}
                color="#3FA16F"
              />

              <Text
                style={
                  styles.imageText
                }
              >
                Open Camera
              </Text>
            </TouchableOpacity>

            {/* GALLERY */}
            <TouchableOpacity
              style={
                styles.imageOption
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

                  showAlert(
                    "Image Selected",
                    "Banner selected successfully.",
                    true
                  );
                }
              }}
            >
              <Ionicons
                name="images"
                size={24}
                color="#3FA16F"
              />

              <Text
                style={
                  styles.imageText
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

      {/* MAIN MODAL */}
      <Modal
        transparent
        visible={
          showModal
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
            <LinearGradient
              colors={
                isSuccess
                  ? [
                      "#75DFA8",
                      "#2F9B68",
                    ]
                  : [
                      "#FF826F",
                      "#B93224",
                    ]
              }
              style={
                styles.iconWrapper
              }
            >
              <Ionicons
                name={
                  isSuccess
                    ? "checkmark"
                    : "close"
                }
                size={34}
                color="#fff"
              />
            </LinearGradient>

            <Text
              style={
                styles.modalTitle
              }
            >
              {modalTitle}
            </Text>

            <Text
              style={
                styles.modalText
              }
            >
              {modalMessage}
            </Text>

            <TouchableOpacity
              onPress={() => {
                setShowModal(
                  false
                );

                if (
                  modalAction
                ) {
                  modalAction();
                }
              }}
            >
              <LinearGradient
                colors={[
                  "#A9E5BC",
                  "#3FA16F",
                ]}
                style={
                  styles.modalButton
                }
              >
                <Text
                  style={
                    styles.buttonText
                  }
                >
                  OK
                </Text>
              </LinearGradient>
            </TouchableOpacity>
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
        "#f3f4f6",
    },

    container: {
      flex: 1,
      backgroundColor:
        "#f3f4f6",
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

    createButton: {
      marginTop: 28,
      height: 56,
      borderRadius: 999,
      justifyContent:
        "center",
      alignItems:
        "center",
      marginBottom: 30,
    },

    buttonText: {
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
    },

    modalContainer: {
      width: 340,
      backgroundColor:
        "#296048",
      borderRadius: 24,
      paddingVertical: 30,
      paddingHorizontal: 24,
      alignItems:
        "center",
    },

    iconWrapper: {
      width: 75,
      height: 75,
      borderRadius: 999,
      justifyContent:
        "center",
      alignItems:
        "center",
      marginBottom: 18,
    },

    modalTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: "#fff",
      marginBottom: 10,
    },

    modalText: {
      fontSize: 14,
      color: "#d4ede0",
      textAlign: "center",
      marginBottom: 24,
      lineHeight: 22,
    },

    modalButton: {
      width: 130,
      height: 45,
      borderRadius: 999,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    imagePickerContainer: {
      width: 320,
      backgroundColor:
        "#296048",
      borderRadius: 24,
      padding: 24,
    },

    imageOption: {
      flexDirection: "row",
      alignItems:
        "center",
      backgroundColor:
        "#fff",
      padding: 16,
      borderRadius: 16,
      marginTop: 14,
    },

    imageText: {
      marginLeft: 12,
      fontSize: 15,
      fontWeight: "600",
      color: "#1F2937",
    },

    cancelButton: {
      marginTop: 18,
      alignItems:
        "center",
    },

    cancelText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "bold",
    },
  });