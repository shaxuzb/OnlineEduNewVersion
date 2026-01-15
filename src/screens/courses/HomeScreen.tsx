import EmptyData from "@/src/components/exceptions/EmptyData";
import ErrorData from "@/src/components/exceptions/ErrorData";
import Skeleton from "@/src/components/Skeleton";
import { lightColors } from "@/src/constants/theme";
import Logo from "@/src/assets/icons/logo/logo.svg";
import { useTheme } from "@/src/context/ThemeContext";
import { useCurrentUserId } from "@/src/hooks/useQuiz";
import { useStatistics } from "@/src/hooks/useStatistics";
import { SubjectStatistic, Theme } from "@/src/types";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo } from "react";
import { moderateScale, ScaledSheet } from "react-native-size-matters";
import {
  Alert,
  Image,
  InteractionManager,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme, themeMode } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const userId = useCurrentUserId();
  const {
    data: subjects,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useStatistics(Number(userId));
  // const { data: subjects, isLoading, error, refetch } = useSubjects();

  // ✅ Fetch user session once

  // ✅ Trigger refetch after UI idle
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => refetch());
    return () => task.cancel();
  }, [refetch]);

  // ✅ Show error only once
  useEffect(() => {
    if (isError) {
      Alert.alert("Xatolik", "Ma'lumotlarni yuklashda xatolik yuz berdi.");
    }
  }, [isError]);

  const overallProgress = useMemo(() => {
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0)
      return 0;

    const totalPercent = subjects.reduce(
      (sum: number, stat: SubjectStatistic) => sum + stat.percent,
      0
    );
    return Math.round(totalPercent / subjects.length);
  }, [subjects]);
  const handleSubjectPress = useCallback(
    (subject: SubjectStatistic) => {
      (navigation as any).navigate("SubjectScreen", {
        subjectId: subject.subjectId,
        percent: subject.percent,
        subjectName: subject.subjectName,
      });
    },
    [navigation]
  );

  const getSubjectIcon = useCallback(
    (name: string) => {
      switch (name) {
        case "Algebra":
          return (
            <Image
              resizeMode="contain"
              style={{ flex: 1, resizeMode: "contain" }}
              source={require("@/src/assets/icons/subjects/algebra.png")}
            />
          );
        case "Geometriya":
          return (
            <Image
              resizeMode="contain"
              style={{ flex: 1, resizeMode: "contain" }}
              source={require("@/src/assets/icons/subjects/geometry.png")}
            />
          );
        case "Milliy Sertifikat":
          return (
            <Image
              resizeMode="contain"
              style={{ flex: 1, resizeMode: "contain" }}
              source={require("@/src/assets/icons/subjects/milliysertificat.png")}
            />
          );
        case "Maktab Dasturi":
          return (
            <Image
              resizeMode="contain"
              style={{ flex: 1, resizeMode: "contain" }}
              source={require("@/src/assets/icons/subjects/bolalar.png")}
            />
          );
        default:
          return (
            <Image
              resizeMode="contain"
              style={{ flex: 1, resizeMode: "contain" }}
              source={require("@/src/assets/icons/subjects/bolalar.png")}
            />
          );
      }
    },
    [styles.iconText]
  );
  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading || isFetching}
            onRefresh={refetch}
          />
        }
      >
        <View style={{ flex: 1, backgroundColor: "#3a5dde" }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 10,
              paddingTop: 30,
            }}
          >
            <Pressable
              android_ripple={{
                foreground: true,
                color: lightColors.ripple,
                borderless: true,
                radius: moderateScale(22),
              }}
              style={{
                width: moderateScale(40),
                height: moderateScale(40),
                alignItems: "center",
                justifyContent: "center",
                marginRight: 10,
              }}
              onPress={() => (navigation as any).navigate("Profile")}
            >
              <FontAwesome
                name="user-circle"
                size={moderateScale(28)}
                color="white"
              />
            </Pressable>
            <Logo width={moderateScale(140)} />
            <Pressable
              android_ripple={{
                foreground: true,
                color: lightColors.ripple,
                borderless: true,
                radius: moderateScale(22),
              }}
              style={{
                width: moderateScale(40),
                height: moderateScale(40),
                alignItems: "center",
                justifyContent: "center",
                marginRight: 10,
              }}
              onPress={() => (navigation as any).navigate("News")}
            >
              <Ionicons
                name="notifications-outline"
                size={moderateScale(28)}
                color="white"
              />
            </Pressable>
          </View>
          {isError ? null : (
            <View
              style={{
                padding: 20,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View style={{ gap: 5, minWidth: "40%" }}>
                {isLoading || isFetching
                  ? [...Array(4)].map((_, i) => (
                      <View
                        key={i}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Skeleton
                          width={moderateScale(40)}
                          height={moderateScale(40)}
                          radius={moderateScale(150)}
                          colorMode={themeMode}
                        />
                        <Skeleton
                          width={moderateScale(15)}
                          height={moderateScale(2)}
                          radius={moderateScale(150)}
                          colorMode={themeMode}
                        />
                        <View style={{ flexGrow: 1 }}>
                          <Skeleton
                            height={moderateScale(25)}
                            radius={moderateScale(40)}
                            style={{}}
                            colorMode={themeMode}
                          />
                        </View>
                      </View>
                    ))
                  : subjects?.map((s) => (
                      <View
                        key={s.subjectId}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <LinearGradient
                          colors={["#718ff9ff", "#ffffffff"]}
                          start={{ x: 0.5, y: 1.0 }}
                          style={{
                            width: moderateScale(40),
                            height: moderateScale(40),
                            padding: moderateScale(1),
                            borderRadius: moderateScale(150),
                          }}
                          end={{ x: 0.5, y: 0.0 }}
                        >
                          <View
                            style={{
                              borderRadius: moderateScale(150),
                              width: "100%",
                              height: "100%",
                              backgroundColor: "#3a5dde",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <Text
                              style={{
                                color: "white",
                                fontSize: moderateScale(12),
                                flexWrap: "nowrap",
                              }}
                            >
                              {s.percent.toFixed(1)}%
                            </Text>
                          </View>
                        </LinearGradient>
                        <View
                          style={{
                            width: moderateScale(15),
                            height: moderateScale(1),
                            backgroundColor: "white",
                          }}
                        />
                        <LinearGradient
                          colors={["#718ff9ff", "#ffffffff"]}
                          start={{ x: 0.5, y: 1.0 }}
                          style={{
                            flexGrow: 1,
                            padding: moderateScale(1),
                            borderRadius: moderateScale(40),
                          }}
                          end={{ x: 0.5, y: 0.0 }}
                        >
                          <View
                            style={{
                              paddingVertical: moderateScale(2),
                              paddingHorizontal: moderateScale(16),
                              backgroundColor: "#3a5dde",
                              borderRadius: moderateScale(40),
                            }}
                          >
                            <Text
                              style={{
                                fontSize: moderateScale(15),
                                lineHeight: moderateScale(18),
                                color: "white",
                                fontWeight: "500",
                              }}
                            >
                              {s.subjectName}
                            </Text>
                          </View>
                        </LinearGradient>
                      </View>
                    ))}
              </View>
              <View
                style={{
                  paddingLeft: moderateScale(20),
                  paddingRight: moderateScale(20),
                  flexGrow: 1,
                }}
              >
                {isLoading || isFetching ? (
                  <Skeleton
                    radius={moderateScale(150)}
                    style={{
                      aspectRatio: 1 / 1,
                      flexGrow: 1,
                    }}
                    colorMode={themeMode}
                  />
                ) : (
                  <LinearGradient
                    colors={["#718ff9ff", "#ffffffff"]}
                    start={{ x: 0.5, y: 1.0 }}
                    style={{
                      padding: moderateScale(4),
                      borderRadius: moderateScale(150),
                    }}
                    end={{ x: 0.5, y: 0.0 }}
                  >
                    <View
                      style={{
                        backgroundColor: "#3a5dde",
                        borderRadius: moderateScale(150),
                        aspectRatio: 1 / 1,

                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontSize: moderateScale(42),
                          fontWeight: "700",
                        }}
                      >
                        {overallProgress}%
                      </Text>
                    </View>
                  </LinearGradient>
                )}
              </View>
            </View>
          )}
          <View
            style={{
              flex: 1,
              backgroundColor: theme.colors.background,
              borderTopEndRadius: moderateScale(20),
              borderTopStartRadius: moderateScale(20),
            }}
          >
            <View style={styles.greetingSection}>
              <Text
                style={styles.greeting}
                // onPress={() => {
                //   (navigation as any).navigate("QuizSolution", {
                //     userId: 19,
                //     testId: 36,
                //     themeId: 23,
                //     mavzu: "test",
                //   });
                // }}
              >
                {/* Salom, {userData?.user?.fullName || "mehmon"}! */}
                Kurslar
              </Text>
            </View>

            <View style={styles.section}>
              {isLoading || isFetching ? (
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    width: "100%",
                    padding: 10,
                  }}
                >
                  {[...Array(4)].map((_, i) => (
                    <View style={{ width: "50%", padding: 10 }} key={i}>
                      <Skeleton
                        height={175}
                        radius={12}
                        colorMode={themeMode}
                      />
                    </View>
                  ))}
                </View>
              ) : isError ? (
                <ErrorData refetch={refetch} />
              ) : subjects && subjects.length > 0 ? (
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    width: "100%",
                    padding: 10,
                  }}
                >
                  {subjects.map((s, index) => (
                    <View
                      style={{
                        width: "50%",
                        padding: 10,
                      }}
                      key={index}
                    >
                      <TouchableOpacity
                        key={s.subjectId + index}
                        onPress={() => handleSubjectPress(s)}
                        activeOpacity={0.8}
                        style={{
                          zIndex: 11,
                        }}
                      >
                        <LinearGradient
                          colors={["#3055ddff", "#5e84e6"]}
                          start={{ x: 0.5, y: 1.0 }}
                          style={styles.categoryItem}
                          end={{ x: 0.5, y: 0.0 }}
                        >
                          <View style={[styles.categoryIconContainer]}>
                            {getSubjectIcon(s.subjectName)}
                          </View>
                          <Text style={styles.categoryLabel}>
                            {s.subjectName}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <EmptyData />
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default React.memo(HomeScreen);
const createStyles = (theme: Theme) =>
  ScaledSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    greetingSection: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingVertical: 24,
      paddingBottom: 0,
    },
    greeting: {
      fontSize: moderateScale(26),
      fontWeight: "bold",
      color: theme.colors.text,
    },
    section: { marginVertical: 0 },
    categoryItem: {
      flexDirection: "column",
      alignItems: "center",
      padding: moderateScale(10),
      paddingHorizontal: moderateScale(5),
      aspectRatio: 1,
      borderRadius: moderateScale(12),
      overflow: "hidden",
    },
    categoryIconContainer: {
      borderRadius: moderateScale(12),
      padding: moderateScale(15),
      flexShrink: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    iconText: {
      color: "#fff",
      fontSize: moderateScale(80),
      fontWeight: "bold",
    },
    categoryLabel: {
      fontSize: moderateScale(22),
      flexGrow: 1,
      color: "white",
      fontWeight: "500",
      textAlign: "center",
    },
    linkButton: { alignItems: "center", paddingVertical: 10 },
    linkText: {
      color: theme.colors.primary,
      fontSize: 16,
      textDecorationLine: "underline",
    },
  });
