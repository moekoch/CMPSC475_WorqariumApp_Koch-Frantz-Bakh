import { useScreenNav } from '@/hooks/useScreenNav';
import RegisterScreen from '@/screens/registerScreen';

export default function Register() {
  const navigation = useScreenNav();
  return <RegisterScreen navigation={navigation} />;
}
