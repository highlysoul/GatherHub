import { Redirect } from "expo-router";
import { useAuth } from "./context/AuthContext";

export default function Index() {
  const { user } = useAuth();

  if (!user) return <Redirect href="./page/login" />;

  if (user.role === "admin") return <Redirect href="./page/adminHome" />;

  return <Redirect href="./page/userHome" />;
}
