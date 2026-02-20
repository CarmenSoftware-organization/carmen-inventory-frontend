import type { Metadata } from "next";
import UserProfileDetails from "./_components/user-profile-details";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return <UserProfileDetails />;
}
