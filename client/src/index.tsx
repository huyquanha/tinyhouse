import React, { useEffect, useRef, useState } from "react";
import { render } from "react-dom";
import reportWebVitals from "./reportWebVitals";
import {
  Home,
  Host,
  Listing,
  Listings,
  NotFound,
  User,
  Login,
  AppHeader,
  Signup,
  VerifyEmail,
} from "./sections";
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
  useMutation,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import "./styles/index.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Layout, Affix, Spin } from "antd";
import { Viewer } from "./lib/types";
import { LOG_IN } from "./lib/graphql/mutations";
import {
  LogIn as LogInData,
  LogInVariables,
} from "./lib/graphql/mutations/LogIn/__generated__/LogIn";
import { AppHeaderSkeleton, ErrorBanner } from "./lib/components";
import { UserStatus } from "./lib/graphql/globalTypes";

const httpLink = createHttpLink({
  uri: "/api",
});

const authLink = setContext((_, { headers }) => {
  const token = sessionStorage.getItem("token");
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      "X-CSRF-TOKEN": token ?? "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

const initialViewer: Viewer = {
  id: null,
  status: null,
  contact: null,
  token: null,
  avatar: null,
  hasWallet: null,
  didRequest: false,
};

const App = () => {
  const [viewer, setViewer] = useState<Viewer>(initialViewer);
  const [logIn, { data, error }] = useMutation<LogInData, LogInVariables>(
    LOG_IN,
    {
      onCompleted: (data) => {
        if (data?.logIn.__typename === "Viewer") {
          setViewer(data.logIn);
          if (
            data.logIn.id &&
            data.logIn.status === UserStatus.ACTIVE &&
            data.logIn.token
          ) {
            sessionStorage.setItem("token", data.logIn.token);
          } else {
            // just to be safe
            sessionStorage.removeItem("token");
          }
        }
      },
      onError: (err) => console.error(err),
    }
  );
  const logInRef = useRef(logIn);
  const setViewerRef = useRef(setViewer);

  useEffect(() => {
    const { searchParams, pathname } = new URL(window.location.href);
    if (
      (pathname === "/verifyEmail" && searchParams.get("token")) ||
      (pathname.startsWith("/login") && searchParams.get("code"))
    ) {
      // For a better UX, we don't want to show error
      // for login failure when user is trying to login via provider or
      // verify their email. We will bypass it and let the corresponding routes
      // handles user authentication instead
      // Here we set didRequest to true to not get caught in an infinite loop in the loading check
      setViewerRef.current({
        ...initialViewer,
        didRequest: true,
      });
    } else {
      // we don't send any input here since this is logging in using cookie
      logInRef.current();
    }
  }, []);

  /**
   * Notice that we don't check for if(loading) here because on the initial render,
   * when the logIn Mutation is not called yet, loading will be false => the main <Router> will be
   * mounted inside <App/> instead of the skeleton.
   * When the logIn mutation is triggered by the useEffect() (effectively componentDidMount()),
   * this skeleton will be rendered, causing a re-mount because the component type <Layout> is different
   * from <Router>
   * However, the important piece is that after the logIn mutation completes, we show the <Router> again instead
   * of <Layout className='app-skeleton'> => another un-mount and re-mount happen inside <App/>. This can cause un-expected
   * behavior in child route components which will be mounted twice together with the parent <Router>
   *
   * On the other hand, if the condition is if(!viewer.didRequest && !error), which is true even before the logIn
   * mutation happening, the skeleton will be mounted first, and once the mutation completes the main <Router>
   * is then mounted => the <Router> is only mounted once and so do the child components in Routes.
   */
  if (
    !viewer.didRequest &&
    !error &&
    !data?.logIn.__typename.endsWith("Error")
  ) {
    return (
      <Layout className="app-skeleton">
        <AppHeaderSkeleton />
        <div className="app-skeleton__spin-section">
          <Spin size="large" tip="Launching Tinyhouse" />
        </div>
      </Layout>
    );
  }

  const logInErrorBannerElement =
    error || data?.logIn.__typename.endsWith("Error") ? (
      <ErrorBanner description="We weren't able to verify if you were logged in. Please try again later!" />
    ) : null;

  return (
    <Router>
      <Layout id="app">
        {logInErrorBannerElement}
        <Affix offsetTop={0} className="app__affix-header">
          <AppHeader viewer={viewer} setViewer={setViewer} />
        </Affix>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route exact path="/host">
            <Host />
          </Route>
          <Route exact path="/listing/:id">
            <Listing />
          </Route>
          {/** :location? means location parameter is optional */}
          <Route exact path="/listings/:location?">
            <Listings />
          </Route>
          {/** has to use component here to get the match props */}
          <Route
            exact
            path="/user/:id"
            render={(props) => <User {...props} viewer={viewer} />}
          />
          <Route
            exact
            path={["/login", "/login/google", "/login/facebook"]}
            render={(props) => <Login {...props} setViewer={setViewer} />}
          />
          <Route exact path="/signup" component={Signup} />
          <Route
            exact
            path="/verifyEmail"
            render={(props) => (
              <VerifyEmail {...(props as any)} setViewer={setViewer} />
            )}
          />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </Router>
  );
};

render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
