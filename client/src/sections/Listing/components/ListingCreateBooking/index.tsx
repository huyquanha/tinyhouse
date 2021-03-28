import { Button, Card, Divider, Typography, DatePicker } from "antd";
import { formatListingPrice, displayErrorMessage } from "../../../../lib/utils";
import moment, { Moment } from "moment";

interface Props {
  price: number;
  checkInDate: Moment | null;
  checkOutDate: Moment | null;
  setCheckInDate: (checkInDate: Moment | null) => void;
  setCheckOutDate: (checkOutDate: Moment | null) => void;
}

const { Paragraph, Title } = Typography;

export const ListingCreateBooking = ({
  price,
  checkInDate,
  checkOutDate,
  setCheckInDate,
  setCheckOutDate,
}: Props) => {
  const disabledDate = (dateValue?: Moment): boolean => {
    if (dateValue) {
      // if the date value in the grid is a day before, or even today,
      // it should be disabled
      return dateValue.isBefore(moment().endOf("day"));
    }
    return false;
  };

  const verifyAndSetCheckOutDate = (selectedCheckOutDate: Moment | null) => {
    if (checkInDate && selectedCheckOutDate) {
      if (selectedCheckOutDate.isBefore(checkInDate, "days")) {
        return displayErrorMessage(
          `Check out date can't be prior to check in!`
        );
      }
    }
    setCheckOutDate(selectedCheckOutDate);
  };

  return (
    <div className="listing-bookings">
      <Card className="listing-booking__card">
        <div>
          <Paragraph>
            <Title level={2} className="listing-booking__card-title">
              {formatListingPrice(price)}
              <span>/day</span>
            </Title>
          </Paragraph>
          <Divider />
          <div className="listing-booking__card-date-picker">
            <Paragraph strong>Check In</Paragraph>
            <DatePicker
              value={checkInDate ?? undefined}
              format={"DD/MM/YYYY"}
              disabledDate={disabledDate}
              onChange={(dateValue) => setCheckInDate(dateValue)}
              showToday={false}
              onOpenChange={() => setCheckOutDate(null)}
            />
          </div>
          <div className="listing-booking__card-date-picker">
            <Paragraph strong>Check Out</Paragraph>
            <DatePicker
              value={checkOutDate ?? undefined}
              format={"DD/MM/YYYY"}
              disabledDate={disabledDate}
              onChange={(dateValue) => verifyAndSetCheckOutDate(dateValue)}
              disabled={!checkInDate}
              showToday={false}
            />
          </div>
        </div>
        <Divider />
        <Button
          disabled={!checkInDate || !checkOutDate}
          type="primary"
          size="large"
          className="listing-booking__card-cta"
        >
          Request to book!
        </Button>
      </Card>
    </div>
  );
};
