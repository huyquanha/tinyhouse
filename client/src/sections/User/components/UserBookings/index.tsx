import { List, Typography, Button, Row, Col } from "antd";
import { ListingCard } from "../../../../lib/components";
import { User_user_User_bookings as BookingData } from "../../../../lib/graphql/queries/User/__generated__/User";
import { BookingListingParams } from "../../types";

interface Props {
  userBookings: BookingData[];
  bookingsParams: BookingListingParams;
  setBookingsParams: (params: BookingListingParams) => void;
  limit: number;
}

const { Paragraph, Title, Text } = Typography;

export const UserBookings = ({
  userBookings,
  bookingsParams,
  setBookingsParams,
  limit,
}: Props) => {
  const lastFetchIsNext = bookingsParams.fetchNext;
  const displayBookings =
    userBookings.length <= limit
      ? userBookings
      : lastFetchIsNext
      ? userBookings.slice(0, userBookings.length - 1)
      : userBookings.slice(1);
  const userBookingsList = (
    <List
      grid={{
        gutter: 8,
        xs: 1,
        sm: 2,
        lg: 4,
      }}
      dataSource={displayBookings}
      locale={{ emptyText: "User doesn't have any bookings yet!" }}
      pagination={false}
      renderItem={(userBooking) => {
        const bookingHistory = (
          <div className="user-bookings__booking-history">
            <div>
              Check in:{" "}
              <Text strong>{userBooking.checkIn.toLocaleDateString()}</Text>
            </div>
            <div>
              Check out:{" "}
              <Text strong>{userBooking.checkOut.toLocaleDateString()}</Text>
            </div>
          </div>
        );
        return (
          <List.Item>
            {bookingHistory}
            <ListingCard listing={userBooking.listing} />
          </List.Item>
        );
      }}
    />
  );

  return (
    <div className="user-bookings">
      <Row gutter={12} justify="start">
        <Col span={4}>
          <Title level={4} className="user-bookings__title">
            Bookings
          </Title>
        </Col>
        <Col span={4} offset={11}>
          <Button
            type="dashed"
            size="middle"
            disabled={
              !bookingsParams.lastId ||
              (!lastFetchIsNext && userBookings.length <= limit)
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
            disabled={lastFetchIsNext && userBookings.length <= limit}
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
      <Paragraph className="user-bookings__description">
        This section highlights the bookings you've made, and the
        check-in/check-out dates associated with said bookings.
      </Paragraph>
      {userBookingsList}
    </div>
  );
};
