import { List, Typography, Button, Row, Col } from "antd";
import { BookingListingParams } from "../../types";
import { ListingCard } from "../../../../lib/components";
import { User_user_User_listings as ListingData } from "../../../../lib/graphql/queries/User/__generated__/User";

interface Props {
  userListings: ListingData[];
  listingsParams: BookingListingParams;
  setListingsParams: (params: BookingListingParams) => void;
  limit: number;
}

const { Paragraph, Title } = Typography;

export const UserListings = ({
  userListings,
  setListingsParams,
  listingsParams,
  limit,
}: Props) => {
  const lastFetchIsNext = listingsParams.fetchNext;
  const displayListings =
    userListings.length <= limit
      ? userListings
      : lastFetchIsNext
      ? userListings.slice(0, userListings.length - 1)
      : userListings.slice(1);
  const userListingsList = (
    <List
      grid={{
        gutter: 8,
        xs: 1,
        sm: 2,
        lg: 4,
      }}
      dataSource={displayListings}
      locale={{ emptyText: "User doesn't have any listings yet!" }}
      pagination={false}
      renderItem={(userListing) => (
        <List.Item>
          <ListingCard listing={userListing} />
        </List.Item>
      )}
    />
  );

  return (
    <div className="user-listings">
      <Row gutter={12} justify="start">
        <Col span={4}>
          <Title level={4} className="user-listings__title">
            Listings
          </Title>
        </Col>
        <Col span={4} offset={11}>
          <Button
            type="dashed"
            size="middle"
            disabled={
              !listingsParams.lastId ||
              (!lastFetchIsNext && userListings.length <= limit)
            }
            block
            onClick={() =>
              setListingsParams({
                lastId: displayListings[0]?.id ?? null,
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
            disabled={lastFetchIsNext && userListings.length <= limit}
            block
            onClick={() =>
              setListingsParams({
                lastId: displayListings[displayListings.length - 1]?.id ?? null,
                fetchNext: true,
              })
            }
          >
            Next
          </Button>
        </Col>
      </Row>
      <Paragraph className="user-listings__description">
        This section highlights the listings this user currently hosts and has
        made available for bookings.
      </Paragraph>
      {userListingsList}
    </div>
  );
};
