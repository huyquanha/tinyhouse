import { Layout, Button, Form, Input } from 'antd';
import { AuthAction, Viewer } from '../../lib/types';
import { useMutation } from '@apollo/client';
import { LOG_IN } from '../../lib/graphql/mutations';
import {
  LogIn as LogInData,
  LogInVariables,
} from '../../lib/graphql/mutations/LogIn/__generated__/LogIn';
import { useCallback, useEffect, useRef } from 'react';
import { ErrorBanner, ProviderSignIn } from '../../lib/components';
import {
  displaySuccessNotification,
  shouldDisplayInputError,
  getErrorSpan,
} from '../../lib/utils';
import { Redirect } from 'react-router-dom';
import { Provider, UserStatus } from '../../lib/graphql/globalTypes';
import { useFormik } from 'formik';
import * as yup from 'yup';

const { Content } = Layout;

interface Props {
  setViewer: (viewer: Viewer) => void;
}

interface IFormInputs {
  email: string;
  password: string;
}

export const Login = ({ setViewer }: Props) => {
  const [
    logIn,
    { data: logInData, loading: logInLoading, error: logInError },
  ] = useMutation<LogInData, LogInVariables>(LOG_IN, {
    onCompleted: (data) => {
      if (
        data?.logIn.__typename === 'Viewer' &&
        data.logIn.id &&
        data.logIn.token &&
        data.logIn.status === UserStatus.ACTIVE
      ) {
        setViewer(data.logIn);
        sessionStorage.setItem('token', data.logIn.token);
        displaySuccessNotification(`You've successfully logged in!`);
      }
    },
    onError: (err) => console.error(err),
  });
  const logInRef = useRef(logIn);

  const formik = useFormik<IFormInputs>({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: yup.object().shape({
      email: yup
        .string()
        .required('Email is required')
        .email('Invalid email format'),
      password: yup.string().required('Password is required'),
    }),
    onSubmit: useCallback(
      // we need to use async here so isSubmitting will be set back to false
      async ({ email, password }: IFormInputs) => {
        logInRef.current({
          variables: {
            input: { email, password },
          },
        });
      },
      []
    ),
  });

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

  // if (logInLoading) {
  //   return (
  //     <Content className='log-in'>
  //       <Spin size='large' tip='Logging you in...' />
  //     </Content>
  //   );
  // }

  if (logInData?.logIn.__typename === 'Viewer' && logInData?.logIn?.id) {
    const { id: viewerId, status, contact: email } = logInData.logIn;
    if (status === UserStatus.ACTIVE) {
      return <Redirect to={`/user/${viewerId}`} />;
    } else {
      return (
        <Redirect
          to={{
            pathname: '/verifyEmail',
            state: {
              email,
            },
          }}
        />
      );
    }
  }

  const logInErrorBannerElement =
    logInError ||
    (logInData?.logIn.__typename.endsWith('Error') &&
      logInData.logIn.__typename !== 'UserInputErrors') ? (
      <ErrorBanner description="We weren't able to log you in. Please try again soon." />
    ) : null;

  const emailLogin = (
    <Form
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      onFinish={formik.handleSubmit}
    >
      <Form.Item
        label='Email'
        name='email'
        required={true}
        help={
          shouldDisplayInputError(formik, 'email', logInData?.logIn) &&
          getErrorSpan(formik, 'email', logInData?.logIn)
        }
        validateStatus={
          shouldDisplayInputError(formik, 'email', logInData?.logIn)
            ? 'error'
            : 'success'
        }
      >
        <Input
          type='email'
          value={formik.values.email}
          onChange={formik.handleChange}
        />
      </Form.Item>
      <Form.Item
        label='Password'
        name='password'
        required={true}
        help={
          shouldDisplayInputError(formik, 'password', logInData?.logIn) &&
          getErrorSpan(formik, 'password', logInData?.logIn)
        }
        validateStatus={
          shouldDisplayInputError(formik, 'password', logInData?.logIn)
            ? 'error'
            : 'success'
        }
      >
        <Input.Password
          value={formik.values.password}
          onChange={formik.handleChange}
        />
      </Form.Item>
      <Button
        type='primary'
        size='large'
        htmlType='submit'
        disabled={formik.isSubmitting}
        loading={logInLoading}
      >
        <span>Log in</span>
      </Button>
    </Form>
  );

  return (
    <Content className='log-in'>
      {logInErrorBannerElement}
      <ProviderSignIn action={AuthAction.LOG_IN}>{emailLogin}</ProviderSignIn>
    </Content>
  );
};
