import { useQuery } from "@apollo/client";
import { Layout, Row, Col } from "antd";
import { USER } from "../../lib/graphql/queries";
import {
  User as UserData,
  UserVariables,
} from "../../lib/graphql/queries/User/__generated__/User";
import { RouteComponentProps } from "react-router-dom";
import { ErrorBanner, PageSkeleton } from "../../lib/components";
import { UserProfile } from "./components";
import { Viewer } from "../../lib/types";
import { useState } from "react";
import { UserListings, UserBookings } from "./components";
import { BookingListingParams } from "./types";

interface MatchParams {
  id: string;
}

interface Props extends RouteComponentProps<MatchParams> {
  viewer: Viewer;
}

const { Content } = Layout;

const PAGE_LIMIT = 4;

export const User = ({
  viewer,
  match: {
    params: { id },
  },
}: Props) => {
  const [listingsParams, setListingsParams] = useState<BookingListingParams>({
    lastId: null,
    fetchNext: true,
  });
  const [bookingsParams, setBookingsParams] = useState<BookingListingParams>({
    lastId: null,
    fetchNext: true,
  });

  const { data, loading, error } = useQuery<UserData, UserVariables>(USER, {
    variables: {
      id,
      listingsLastId: listingsParams.lastId,
      bookingsLastId: bookingsParams.lastId,
      listingsLimit: listingsParams.fetchNext
        ? PAGE_LIMIT + 1
        : -(PAGE_LIMIT + 1),
      bookingsLimit: bookingsParams.fetchNext
        ? PAGE_LIMIT + 1
        : -(PAGE_LIMIT + 1),
    },
  });

  if (loading) {
    return (
      <Content className="user">
        <PageSkeleton />
      </Content>
    );
  }

  if (error || data?.user.__typename.endsWith("Error")) {
    return (
      <Content className="user">
        <ErrorBanner description="This user may not exist or we've encountered an error. Please try again soon." />
        <PageSkeleton />
      </Content>
    );
  }

  const user = data && data.user.__typename === "User" ? data.user : null;
  const viewerIsUser = viewer.id === id;

  const userListings = user?.listings;
  const userBookings = viewerIsUser ? user?.bookings : null;

  const userProfileElement = user ? (
    <UserProfile user={user} viewerIsUser={viewerIsUser} />
  ) : null;

  const userListingsElement = userListings ? (
    <UserListings
      userListings={userListings}
      setListingsParams={setListingsParams}
      listingsParams={listingsParams}
      limit={PAGE_LIMIT}
    />
  ) : null;

  const userBookingsElement = userBookings ? (
    <UserBookings
      userBookings={userBookings}
      setBookingsParams={setBookingsParams}
      bookingsParams={bookingsParams}
      limit={PAGE_LIMIT}
    />
  ) : null;

  return (
    <Content className="user">
      <Row gutter={12} justify="space-between">
        <Col xs={24}>{userProfileElement}</Col>
        <Col xs={24}>
          {userListingsElement}
          {userBookingsElement}
        </Col>
      </Row>
    </Content>
  );
};
