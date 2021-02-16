import { Link } from "react-router-dom";
import { Avatar, Button, Menu } from "antd";
import { HomeOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { AuthAction, Viewer } from "../../../../lib/types";
import { useMutation } from "@apollo/client";
import { LOG_OUT } from "../../../../lib/graphql/mutations";
import { LogOut as LogOutData } from "../../../../lib/graphql/mutations/LogOut/__generated__/LogOut";
import {
  displaySuccessNotification,
  displayErrorMessage,
} from "../../../../lib/utils";
import { useCallback, useRef } from "react";

const { Item, SubMenu } = Menu;

interface Props {
  viewer: Viewer;
  setViewer: (viewer: Viewer) => void;
}

export const MenuItems = ({ viewer, setViewer }: Props) => {
  const [logOut] = useMutation<LogOutData>(LOG_OUT, {
    onCompleted: (data) => {
      if (data && data.logOut) {
        setViewer(data.logOut);
        sessionStorage.removeItem("token");
        displaySuccessNotification(`You've successfully logged out!`);
      }
    },
    onError: () =>
      displayErrorMessage(
        `Sorry! We weren't able to log you out. Please try again later!`
      ),
  });
  const logOutRef = useRef(logOut);
  const handleLogOut = useCallback(() => logOutRef.current(), []);

  const subMenuLogin = viewer.id ? (
    <SubMenu title={<Avatar src={viewer.avatar} />}>
      <Item key="/user">
        <UserOutlined />
        Profile
      </Item>
      <Item key="/logout">
        <div onClick={handleLogOut}>
          <LogoutOutlined />
          Log out
        </div>
      </Item>
    </SubMenu>
  ) : (
    <Item key="/login">
      <Link to="/login">
        <Button type="primary">{AuthAction.LOG_IN}</Button>
      </Link>
    </Item>
  );
  const signUpItem = !viewer.id ? (
    <Item key="/signup">
      <Link to="/signup">
        <Button type="default">{AuthAction.SIGN_UP}</Button>
      </Link>
    </Item>
  ) : null;
  return (
    <Menu mode="horizontal" selectable={false} className="menu">
      <Item key="/host">
        <Link to="/host">
          <HomeOutlined />
          Host
        </Link>
      </Item>
      {subMenuLogin}
      {signUpItem}
    </Menu>
  );
};
