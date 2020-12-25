import { Card, Layout, Spin, Typography } from 'antd';
import googleLogo from './assets/google_logo.jpg';
import facebookLogo from './assets/facebook_logo.png';
import { Viewer } from '../../lib/types';
import { useApolloClient, useMutation } from '@apollo/client';
import { AUTH_URL } from '../../lib/graphql/queries';
import { LOG_IN } from '../../lib/graphql/mutations';
import {
  AuthUrl as AuthUrlData,
  AuthUrlVariables,
} from '../../lib/graphql/queries/AuthUrl/__generated__/AuthUrl';
import {
  LogIn as LogInData,
  LogInVariables,
} from '../../lib/graphql/mutations/LogIn//__generated__/LogIn';
import { useCallback, useEffect, useRef } from 'react';
import { ErrorBanner } from '../../lib/components';
import {
  displaySuccessNotification,
  displayErrorMessage,
} from '../../lib/utils';
import { Redirect } from 'react-router-dom';
import { Provider } from '../../lib/graphql/globalTypes';

const { Content } = Layout;
const { Text, Title } = Typography;

interface Props {
  setViewer: (viewer: Viewer) => void;
}

export const Login = ({ setViewer }: Props) => {
  const client = useApolloClient();
  const clientRef = useRef(client);
  const [
    logIn,
    { data: logInData, loading: logInLoading, error: logInError },
  ] = useMutation<LogInData, LogInVariables>(LOG_IN, {
    onCompleted: (data) => {
      if (data && data.logIn && data.logIn.token) {
        setViewer(data.logIn);
        sessionStorage.setItem('token', data.logIn.token);
        displaySuccessNotification(`You've successfully logged in!`);
      }
    },
    onError: (err) => console.error(err),
  });
  const logInRef = useRef(logIn);

  useEffect(() => {
    const { pathname, searchParams } = new URL(window.location.href);
    const providerName = pathname.split('/')[2]; // because pathname starts with "/", we need to access the 3rd element
    let provider = null;
    switch (providerName) {
      case 'google':
        provider = Provider.GOOGLE;
        break;
      case 'facebook':
        provider = Provider.FACEBOOK;
        break;
      default:
        break;
    }
    const code = searchParams.get('code');
    if (provider && code) {
      logInRef.current({
        variables: {
          input: { code, provider },
        },
      });
    }
  }, []);

  const handleAuthorize = useCallback(async (provider: Provider) => {
    try {
      const { data } = await clientRef.current.query<
        AuthUrlData,
        AuthUrlVariables
      >({
        query: AUTH_URL,
        variables: {
          input: {
            provider,
          },
        },
      });
      window.location.href = data.authUrl;
    } catch {
      displayErrorMessage(
        `Sorry! We weren't able to log you in. Please try again later!`
      );
    }
  }, []);

  if (logInLoading) {
    return (
      <Content className='log-in'>
        <Spin size='large' tip='Logging you in...' />
      </Content>
    );
  }

  if (logInData && logInData.logIn) {
    const { id: viewerId } = logInData.logIn;
    return <Redirect to={`/user/${viewerId}`} />;
  }

  const logInErrorBannerElement = logInError ? (
    <ErrorBanner description="We weren't able to log you in. Please try again soon." />
  ) : null;

  return (
    <Content className='log-in'>
      {logInErrorBannerElement}
      <Card className='log-in-card'>
        <div className='log-in-card__intro'>
          <Title level={3} className='log-in-card__intro-title'>
            <span role='img' aria-label='wave'>
              👋
            </span>
          </Title>
          <Title level={3} className='log-in-card__intro-title'>
            Log in to TinyHouse!
          </Title>
          <Text>Sign in to start booking available rentals!</Text>
        </div>
        <button
          className='log-in-card__google-button'
          onClick={() => handleAuthorize(Provider.GOOGLE)}
        >
          <img
            src={googleLogo}
            alt='Google Logo'
            className='log-in-card__google-button-logo'
          />
          <span className='log-in-card__google-button-text'>
            Sign in With Google
          </span>
        </button>
        <span>or</span>
        <button
          className='log-in-card__google-button'
          onClick={() => handleAuthorize(Provider.FACEBOOK)}
        >
          <img
            src={facebookLogo}
            alt='Facebook Logo'
            className='log-in-card__google-button-logo'
          />
          <span className='log-in-card__google-button-text'>
            Sign in With Facebook
          </span>
        </button>
        <Text type='secondary' className='log-in-card__note'>
          Note: By signing in, you'll be redirected to the provider's consent
          form to sign in with your account.
        </Text>
      </Card>
    </Content>
  );
};
