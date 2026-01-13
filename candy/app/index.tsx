import { Redirect } from 'expo-router';

export default function Index() {
  // Khi mở app, chuyển hướng sang màn hình Login
  return <Redirect href="/Login" />;
}
