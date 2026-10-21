import { useScreenNav } from '@/hooks/useScreenNav';
import RegisterScreen from '@/screens/RegisterScreen';

export default function Register() {
  const navigation = useScreenNav();
  return <RegisterScreen navigation={navigation} />;
}
