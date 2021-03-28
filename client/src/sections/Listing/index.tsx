import { useQuery } from "@apollo/client";
import { useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { LISTING } from "../../lib/graphql/queries";
import {
  Listing as ListingData,
  ListingVariables,
  Listing_listing_Listing_bookings,
} from "../../lib/graphql/queries/Listing/__generated__/Listing";
import { BookingListingParams } from "../../lib/types";
import { ErrorBanner, PageSkeleton } from "../../lib/components";
import { Layout, Row, Col } from "antd";
import {
  ListingDetails,
  ListingBookings,
  ListingCreateBooking,
} from "./components";
import { Moment } from "moment";

interface MatchParams {
  id: string;
}

interface Props extends RouteComponentProps<MatchParams> {}

const PAGE_LIMIT = 3;

const { Content } = Layout;

export const Listing = ({ match }: Props) => {
  const [checkInDate, setCheckInDate] = useState<Moment | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Moment | null>(null);

  const [bookingsParams, setBookingsParams] = useState<BookingListingParams>({
    lastId: null,
    fetchNext: true,
  });

  const { data, loading, error } = useQuery<ListingData, ListingVariables>(
    LISTING,
    {
      variables: {
        id: match.params.id,
        bookingsLastId: bookingsParams.lastId,
        bookingsLimit: bookingsParams.fetchNext
          ? PAGE_LIMIT + 1
          : -(PAGE_LIMIT + 1),
      },
    }
  );

  if (loading) {
    return (
      <Content className="listings">
        <PageSkeleton />
      </Content>
    );
  }

  if (error || data?.listing.__typename.endsWith("Error")) {
    return (
      <Content className="listings">
        <ErrorBanner description="This listing may not exist or we've encountered an error. Please try again soon." />
        <PageSkeleton />
      </Content>
    );
  }

  const listing =
    data && data.listing.__typename === "Listing" ? data.listing : null;
  // const listingBookings = listing?.bookings;
  const listingBookings: Listing_listing_Listing_bookings[] = [
    {
      id: "5daa530eefc64b001767247c",
      tenant: {
        id: "117422637055829818290",
        name: "User X",
        avatar:
          "https://lh3.googleusercontent.com/a-/AAuE7mBL9NpzsFA6mGSC8xIIJfeK4oTeOJpYvL-gAyaB=s100",
        __typename: "User",
      },
      checkIn: new Date("2019-10-29"),
      checkOut: new Date("2019-10-31"),
      __typename: "Booking",
    },
    {
      id: "5daa530eefc64b001767247d",
      tenant: {
        id: "117422637055829818290",
        name: "User X",
        avatar:
          "https://lh3.googleusercontent.com/a-/AAuE7mBL9NpzsFA6mGSC8xIIJfeK4oTeOJpYvL-gAyaB=s100",
        __typename: "User",
      },
      checkIn: new Date("2019-11-01"),
      checkOut: new Date("2019-11-03"),
      __typename: "Booking",
    },
    {
      id: "5daa530eefc64b001767247g",
      tenant: {
        id: "117422637055829818290",
        name: "User X",
        avatar:
          "https://lh3.googleusercontent.com/a-/AAuE7mBL9NpzsFA6mGSC8xIIJfeK4oTeOJpYvL-gAyaB=s100",
        __typename: "User",
      },
      checkIn: new Date("2019-11-05"),
      checkOut: new Date("2019-11-09"),
      __typename: "Booking",
    },
    {
      id: "5daa530eefc64b001767247f",
      tenant: {
        id: "117422637055829818290",
        name: "User X",
        avatar:
          "https://lh3.googleusercontent.com/a-/AAuE7mBL9NpzsFA6mGSC8xIIJfeK4oTeOJpYvL-gAyaB=s100",
        __typename: "User",
      },
      checkIn: new Date("2019-11-10"),
      checkOut: new Date("2019-11-11"),
      __typename: "Booking",
    },
  ];

  const listingDetailsElement = listing ? (
    <ListingDetails listing={listing} />
  ) : null;

  const listingBookingsElement = listingBookings ? (
    <ListingBookings
      listingBookings={listingBookings}
      bookingsParams={bookingsParams}
      setBookingsParams={setBookingsParams}
      limit={PAGE_LIMIT}
    />
  ) : null;

  const listingCreateBookingElement = listing ? (
    <ListingCreateBooking
      price={listing.price}
      checkInDate={checkInDate}
      checkOutDate={checkOutDate}
      setCheckInDate={setCheckInDate}
      setCheckOutDate={setCheckOutDate}
    />
  ) : null;

  return (
    <Content className="listings">
      <Row gutter={24} justify="space-between">
        <Col xs={24} lg={14}>
          {listingDetailsElement}
          {listingBookingsElement}
        </Col>
        <Col xs={24} lg={10}>
          {listingCreateBookingElement}
        </Col>
      </Row>
    </Content>
  );
};
