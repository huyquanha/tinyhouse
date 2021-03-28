import { Avatar, Divider, List, Typography, Row, Col, Button } from "antd";
import { Link } from "react-router-dom";
import { Listing_listing_Listing_bookings as BookingData } from "../../../../lib/graphql/queries/Listing/__generated__/Listing";
import { BookingListingParams } from "../../../../lib/types";

interface Props {
  listingBookings: BookingData[];
  bookingsParams: BookingListingParams;
  setBookingsParams: (params: BookingListingParams) => void;
  limit: number;
}

const { Title, Text } = Typography;

export const ListingBookings = ({
  listingBookings,
  bookingsParams,
  setBookingsParams,
  limit,
}: Props) => {
  const lastFetchIsNext = bookingsParams.fetchNext;
  const displayBookings =
    listingBookings.length <= limit
      ? listingBookings
      : lastFetchIsNext
      ? listingBookings.slice(0, listingBookings.length - 1)
      : listingBookings.slice(1);
  const listingBookingsList = (
    <List
      grid={{
        gutter: 8,
        xs: 1,
        sm: 2,
        lg: 3,
      }}
      dataSource={displayBookings}
      locale={{ emptyText: "No bookings have been made yet!" }}
      pagination={false}
      renderItem={(listingBooking) => {
        const bookingHistory = (
          <div className="listing-bookings__history">
            <div>
              Check in:{" "}
              <Text strong>{listingBooking.checkIn.toLocaleDateString()}</Text>
            </div>
            <div>
              Check out:{" "}
              <Text strong>{listingBooking.checkOut.toLocaleDateString()}</Text>
            </div>
          </div>
        );
        return (
          <List.Item className="listing-bookings__item">
            {bookingHistory}
            <Link to={`/user/${listingBooking.tenant.id}`}>
              <Avatar
                src={listingBooking.tenant.avatar}
                size={64}
                shape="square"
              />
            </Link>
          </List.Item>
        );
      }}
    />
  );

  return (
    <div className="listing-bookings">
      <Divider />
      <Row gutter={12} justify="start">
        <Col span={4}>
          <div className="listing-bookings__section">
            <Title level={4}>Bookings</Title>
          </div>
        </Col>
        <Col span={4} offset={11}>
          <Button
            type="dashed"
            size="middle"
            disabled={
              !bookingsParams.lastId ||
              (!lastFetchIsNext && listingBookings.length <= limit)
            }
            block
            onClick={() =>
              setBookingsParams({
                lastId: displayBookings[0]?.id ?? null,
                fetchNext: false,
              })
            }
          >
            Previous
          </Button>
        </Col>
        <Col span={4}>
          <Button
            type="dashed"
            size="middle"
            disabled={lastFetchIsNext && listingBookings.length <= limit}
            block
            onClick={() =>
              setBookingsParams({
                lastId: displayBookings[displayBookings.length - 1]?.id ?? null,
                fetchNext: true,
              })
            }
          >
            Next
          </Button>
        </Col>
      </Row>
      {listingBookingsList}
    </div>
  );
};
