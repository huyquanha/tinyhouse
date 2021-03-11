import { useMutation } from "@apollo/client";
import { Card, Typography, Layout, Spin } from "antd";
import { useEffect, useRef } from "react";
import { Viewer } from "../../lib/types";
import {
  VerifyEmail as VerifyEmailData,
  VerifyEmailVariables,
} from "../../lib/graphql/mutations/VerifyEmail/__generated__/VerifyEmail";
import { VERIFY_EMAIL } from "../../lib/graphql/mutations/VerifyEmail";
import { displaySuccessNotification } from "../../lib/utils";
import { Redirect, RouteComponentProps } from "react-router-dom";
import { ErrorBanner } from "../../lib/components";

const { Text, Title } = Typography;

const { Content } = Layout;

interface LocationState {
  email?: string;
}

interface Props
  extends RouteComponentProps<any, any, LocationState | undefined> {
  setViewer: (viewer: Viewer) => void;
}

export const VerifyEmail = ({ setViewer, location: { state } }: Props) => {
  const [
    verifyEmail,
    {
      data: verifyEmailData,
      loading: verifyEmailLoading,
      error: verifyEmailError,
    },
  ] = useMutation<VerifyEmailData, VerifyEmailVariables>(VERIFY_EMAIL, {
    onCompleted: (data) => {
      if (
        data?.verifyEmail?.__typename === "Viewer" &&
        data?.verifyEmail.id &&
        data.verifyEmail.token
      ) {
        setViewer(data.verifyEmail);
        sessionStorage.setItem("token", data.verifyEmail.token);
        displaySuccessNotification("Your account has been verified!");
      }
    },
    onError: (err) => console.error(err),
  });
  const verifyEmailRef = useRef(verifyEmail);

  useEffect(() => {
    const { searchParams } = new URL(window.location.href);
    const token = searchParams.get("token");
    // If the email is attached in the state, this component is meant to
    // show a notification that email has been sent => should not attempt
    // to fire the verify mutation.
    // Otherwise if state.email is undefined, and we have a token, we will attempt
    // to verify the email
    if (!state?.email && token) {
      verifyEmailRef.current({
        variables: {
          token,
        },
      });
    }
  }, [state]);

  if (verifyEmailLoading) {
    return (
      <Content className="center-spinner">
        <Spin size="large" tip="Verifying your account..." />
      </Content>
    );
  }

  if (
    verifyEmailError ||
    verifyEmailData?.verifyEmail.__typename.endsWith("Error")
  ) {
    return (
      <Content className="log-in">
        <ErrorBanner description="We weren't able to verify your account. Please try again soon." />
      </Content>
    );
  }

  if (
    verifyEmailData?.verifyEmail?.__typename === "Viewer" &&
    verifyEmailData?.verifyEmail?.id
  ) {
    const { id: viewerId } = verifyEmailData.verifyEmail;
    return <Redirect to={`/user/${viewerId}`} />;
  }

  return (
    <Content className="log-in">
      <Card className="log-in-card">
        <div className="log-in-card__intro">
          <Title level={3} className="log-in-card__intro-title">
            {"Please verify your email to access your account"}
          </Title>
          <Text>{`A verification email has been sent to ${
            state?.email ?? "your email address"
          }`}</Text>
        </div>
      </Card>
    </Content>
  );
};
