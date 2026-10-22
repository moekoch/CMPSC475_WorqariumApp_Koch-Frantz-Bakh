import { useScreenNav } from '@/hooks/useScreenNav';
import { api, setToken } from '@/lib/api';
import LoginScreen from '@/screens/loginScreen';

export default function Login() {
  const navigation = useScreenNav();

  // send username and password to server then save login token
  const handleLogin = async ({ 
    username,
    password
  }: {
    username: string;
    password: string
  }) => {
    const data = await api('/api/login', {
      method: 'POST',
      body: { username, password },
    });
    await setToken(data.token);
  };
  
  return (
    <LoginScreen
      navigation={navigation}
      onLogin={handleLogin}
      onReturnToSession={() => navigation.replace('joinSession')}
    />
  );
}
