import { useScreenNav } from '@/hooks/useScreenNav';
import LoginScreen from '@/screens/loginScreen';

export default function Login() {
  const navigation = useScreenNav();
  return (
    <LoginScreen
      navigation={navigation}
      onReturnToSession={() => navigation.replace('joinSession')}
    />
  );
}
