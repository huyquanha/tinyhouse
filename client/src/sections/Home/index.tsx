import { Layout, Typography, Row, Col } from "antd";
import { HomeHero, HomeListings, HomeListingsSkeleton } from "./components";
import mapBackground from "./assets/map-background.jpg";
import { RouteComponentProps } from "react-router-dom";
import { displayErrorMessage } from "../../lib/utils";
import { Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { LISTINGS } from "../../lib/graphql/queries";
import {
  Listings as ListingsData,
  ListingsVariables,
} from "../../lib/graphql/queries/Listings/__generated__/Listings";
import { ListingsFilter } from "../../lib/graphql/globalTypes";

import sanFransiscoImage from "./assets/san-fransisco.jpg";
import cancunImage from "./assets/cancun.jpg";

const { Content } = Layout;
const { Paragraph, Title } = Typography;

const PAGE_LIMIT = 4;

export const Home = ({ history }: RouteComponentProps) => {
  // we don't really care if the query ever fails, we just don't show
  // the premium listings anymore in that case => no need to destruct error
  const { data, loading } = useQuery<ListingsData, ListingsVariables>(
    LISTINGS,
    {
      variables: {
        input: {
          filter: ListingsFilter.PRICE_HIGH_TO_LOW,
          limit: PAGE_LIMIT,
        },
      },
    }
  );

  const renderListingsSection = () => {
    if (loading) {
      return <HomeListingsSkeleton />;
    }

    if (data) {
      return <HomeListings title="Preimum Listings" listings={data.listings} />;
    }

    // error case
    return null;
  };

  const onSearch = (value: string): void => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      displayErrorMessage("Please enter a valid search!");
    } else {
      // history.push automatically url-encodes trimmedValue
      // so we don't need to do that manually
      history.push(`/listings/${trimmedValue}`);
    }
  };

  return (
    <Content
      className="home"
      style={{ backgroundImage: `url(${mapBackground})` }}
    >
      <HomeHero onSearch={onSearch} />

      <div className="home__cta-section">
        <Title level={2} className="home__cta-section-title">
          Your guide for all things rental
        </Title>
        <Paragraph>
          Helping you make the best decsion in renting your last minute
          locations.
        </Paragraph>
        {/** style the React Router Link like an Ant Design button */}
        <Link
          to="/listings/united%20states"
          className="ant-btn ant-btn-primary ant-btn-lg home__cta-section-button"
        >
          Popular listings in the United States
        </Link>
      </div>
      {renderListingsSection()}
      <div className="home__listings">
        <Title level={4} className="home__listings-title">
          Listing of any kind
        </Title>
        <Row gutter={12}>
          <Col xs={24} sm={12}>
            <Link to="/listings/san%20francisco">
              <div className="home__listings-img-cover">
                <img
                  src={sanFransiscoImage}
                  alt="San Fransisco"
                  className="home__listings-img"
                />
              </div>
            </Link>
          </Col>
          <Col xs={24} sm={12}>
            <Link to="/listings/cancún">
              <div className="home__listings-img-cover">
                <img
                  src={cancunImage}
                  alt="Cancún"
                  className="home__listings-img"
                />
              </div>
            </Link>
          </Col>
        </Row>
      </div>
    </Content>
  );
};
