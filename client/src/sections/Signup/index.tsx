import { Layout, Button, Form, Input } from 'antd';
import { AuthAction } from '../../lib/types';
import { useMutation } from '@apollo/client';
import {
  SignUp as SignUpData,
  SignUpVariables,
} from '../../lib/graphql/mutations/SignUp/__generated__/SignUp';
import { useCallback, useRef } from 'react';
import { ErrorBanner, ProviderSignIn } from '../../lib/components';
import {
  displaySuccessNotification,
  shouldDisplayInputError,
  getErrorSpan,
} from '../../lib/utils';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { SIGN_UP } from '../../lib/graphql/mutations/SignUp';
import { Redirect } from 'react-router-dom';

const { Content } = Layout;

interface IFormInputs {
  name: string;
  email: string;
  password: string;
}

export const Signup = () => {
  const [
    signUp,
    { data: signUpData, loading: signUpLoading, error: signUpError },
  ] = useMutation<SignUpData, SignUpVariables>(SIGN_UP, {
    onCompleted: (data) => {
      if (data?.signUp?.__typename === 'Viewer' && data?.signUp.contact) {
        displaySuccessNotification(`You've successfully signed up!`);
      }
    },
    onError: (err) => console.error(err),
  });
  const signUpRef = useRef(signUp);

  const formik = useFormik<IFormInputs>({
    initialValues: {
      name: '',
      email: '',
      password: '',
    },
    validationSchema: yup.object().shape({
      name: yup.string().required('Name is required'),
      email: yup
        .string()
        .required('Email is required')
        .email('Invalid email format'),
      password: yup
        .string()
        .required('Password is required')
        .min(8, 'Password should be minimum 8 characters')
        .matches(
          // this is the original /^[a-zA-Z]*[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+[a-zA-Z]*$/
          // /^(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).*$/
          /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).*$/,
          'Password must have at least one uppercase, one lowercase, one number and one special character'
        ),
    }),
    onSubmit: useCallback(
      // we need to use async here so isSubmitting will be set back to false
      async ({ name, email, password }: IFormInputs) => {
        signUpRef.current({
          variables: {
            input: { name, email, password },
          },
        });
      },
      []
    ),
  });

  if (
    signUpData?.signUp?.__typename === 'Viewer' &&
    signUpData?.signUp.contact
  ) {
    return (
      <Redirect
        to={{
          pathname: '/verifyEmail',
          state: {
            email: signUpData?.signUp.contact,
          },
        }}
      />
    );
  }

  const signUpErrorBannerElement =
    signUpData?.signUp?.__typename === 'DatabaseError' || signUpError ? (
      <ErrorBanner description="We weren't able to sign you in. Please try again soon." />
    ) : null;

  const emailSignUp = (
    <Form
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      onFinish={formik.handleSubmit}
    >
      <Form.Item
        label='Name'
        name='name'
        required={true}
        help={
          shouldDisplayInputError(formik, 'name', signUpData?.signUp) &&
          getErrorSpan(formik, 'name', signUpData?.signUp)
        }
        validateStatus={
          shouldDisplayInputError(formik, 'name', signUpData?.signUp)
            ? 'error'
            : 'success'
        }
      >
        <Input
          type='text'
          value={formik.values.name}
          onChange={formik.handleChange}
        />
      </Form.Item>
      <Form.Item
        label='Email'
        name='email'
        required={true}
        help={
          shouldDisplayInputError(formik, 'email', signUpData?.signUp) &&
          getErrorSpan(formik, 'email', signUpData?.signUp)
        }
        validateStatus={
          shouldDisplayInputError(formik, 'email', signUpData?.signUp)
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
          shouldDisplayInputError(formik, 'password', signUpData?.signUp) &&
          getErrorSpan(formik, 'password', signUpData?.signUp)
        }
        validateStatus={
          shouldDisplayInputError(formik, 'password', signUpData?.signUp)
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
        loading={signUpLoading}
      >
        <span>Sign up</span>
      </Button>
    </Form>
  );

  return (
    <Content className='log-in'>
      {signUpErrorBannerElement}
      <ProviderSignIn action={AuthAction.SIGN_UP}>{emailSignUp}</ProviderSignIn>
    </Content>
  );
};
