import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../src/lib/supabase";
import { useUser, useUpdateUser } from "../../src/lib/hooks/useUser";

export default function ProfileScreen() {
  const router = useRouter();
  const { data: user, isLoading, error } = useUser();
  const updateUser = useUpdateUser();
  const [name, setName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user?.name]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/(auth)/login");
  }

  function handleSave() {
    updateUser.mutate(
      { name },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-red-500">Error loading profile</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        <View className="bg-white rounded-lg shadow-sm p-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-gray-900">
              Your Profile
            </Text>
            <TouchableOpacity onPress={handleLogout}>
              <Text className="text-gray-600">Sign out</Text>
            </TouchableOpacity>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Email
              </Text>
              <Text className="text-gray-900">{user?.email}</Text>
            </View>

            <View className="mt-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Name
              </Text>
              {isEditing ? (
                <View className="flex-row gap-2">
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    placeholder="Enter your name"
                  />
                  <TouchableOpacity
                    onPress={handleSave}
                    disabled={updateUser.isPending}
                    className="px-4 py-2 bg-blue-600 rounded-lg justify-center"
                  >
                    {updateUser.isPending ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text className="text-white font-medium">Save</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setIsEditing(false);
                      setName(user?.name || "");
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg justify-center"
                  >
                    <Text className="text-gray-700">Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-900">
                    {user?.name || "Not set"}
                  </Text>
                  <TouchableOpacity onPress={() => setIsEditing(true)}>
                    <Text className="text-blue-600">Edit</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View className="mt-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Member since
              </Text>
              <Text className="text-gray-900">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "-"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
