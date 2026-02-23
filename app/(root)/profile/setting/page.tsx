import { Metadata } from "next";
import UserProfileSetting from "../_components/user-profile-setting";

export const metadata: Metadata = {
  title: "Profile Setting",
};

export default function ProfileSettingPage() {
  return <UserProfileSetting />;
}
