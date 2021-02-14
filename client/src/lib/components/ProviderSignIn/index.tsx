import { Provider } from '../../graphql/globalTypes';
import { Card, Typography, Button, Divider } from 'antd';
import googleLogo from './assets/google_logo.jpg';
import facebookLogo from './assets/facebook_logo.png';
import { AuthAction } from '../../types';
import { useApolloClient } from '@apollo/client';
import { PropsWithChildren, useCallback, useRef } from 'react';
import {
  AuthUrl as AuthUrlData,
  AuthUrlVariables,
} from '../../../lib/graphql/queries/AuthUrl/__generated__/AuthUrl';
import { AUTH_URL } from '../../graphql/queries';
import { displayErrorMessage } from '../../../lib/utils';

const { Text, Title } = Typography;

interface Props {
  action: AuthAction;
}

export const ProviderSignIn = ({
  action,
  children,
}: PropsWithChildren<Props>) => {
  const client = useApolloClient();
  const clientRef = useRef(client);

  const handleAuthorize = useCallback(
    async (provider: Provider): Promise<void> => {
      try {
        const { data } = await clientRef.current.query<
          AuthUrlData,
          AuthUrlVariables
        >({
          query: AUTH_URL,
          variables: {
            provider,
          },
        });
        window.location.href = data.authUrl;
      } catch {
        displayErrorMessage(
          `Sorry! We weren't able to log you in. Please try again later!`
        );
      }
    },
    []
  );

  return (
    <Card className='log-in-card'>
      <div className='log-in-card__intro'>
        <Title level={3} className='log-in-card__intro-title'>
          <span role='img' aria-label='wave'>
            👋
          </span>
        </Title>
        <Title level={3} className='log-in-card__intro-title'>
          {`${action} to TinyHouse!`}
        </Title>
        <Text>{`${action} to start booking available rentals!`}</Text>
      </div>
      <Button
        className='log-in-card__provider-button'
        type='primary'
        block
        size='large'
        onClick={() => handleAuthorize(Provider.GOOGLE)}
      >
        <img
          src={googleLogo}
          alt='Google Logo'
          className='log-in-card__provider-button-logo'
        />
        <span className='log-in-card__provider-button-text'>
          {`${action} with Google`}
        </span>
      </Button>
      <Button
        className='log-in-card__provider-button'
        type='primary'
        block
        size='large'
        onClick={() => handleAuthorize(Provider.FACEBOOK)}
      >
        <img
          src={facebookLogo}
          alt='Facebook Logo'
          className='log-in-card__provider-button-logo'
        />
        <span className='log-in-card__provider-button-text'>
          {`${action} with Facebook`}
        </span>
      </Button>
      <Divider>or</Divider>
      {children}
      {/* <Text type='secondary' className='log-in-card__note'>
        Note: By signing in, you'll be redirected to the provider's consent form
        to sign in with your account.
      </Text> */}
    </Card>
  );
};
