import { useScreenNav } from '@/hooks/useScreenNav';
import { api } from '@/lib/api';
import RegisterScreen from '@/screens/RegisterScreen';

export default function Register() {
  const navigation = useScreenNav();

  // send the new account info to server
  const handleRegister = async ({
    username,
    email,
    password,
  }: {
    username: string;
    email: string;
    password: string;
  }) => {
    await api('/api/users', {
      method: 'POST',
      body: { username, email, password },
    });
  };

  return (
    <RegisterScreen
      navigation={navigation}
      onRegister={handleRegister}
    />
  );
}
