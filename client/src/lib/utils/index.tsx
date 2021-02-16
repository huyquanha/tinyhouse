import { message, notification } from "antd";
import { FormikErrors, FormikTouched } from "formik";

export const displaySuccessNotification = (
  message: string,
  description?: string
) => {
  return notification["success"]({
    message,
    description,
    placement: "topLeft",
    style: {
      marginTop: 50,
    },
  });
};

export const displayErrorMessage = (error: string) => {
  return message.error(error);
};

export const shouldDisplayInputError = <T extends Record<string, unknown>>(
  {
    errors,
    touched,
  }: {
    errors: FormikErrors<T>;
    touched: FormikTouched<T>;
  },
  input: keyof T,
  data?: { __typename: string; errors?: { input: string; message: string }[] }
): boolean =>
  !!(errors[input] && touched[input]) ||
  (data?.__typename === "UserInputErrors" &&
    (data?.errors ?? []).some((e) => e.input === input));

export const getErrorSpan = <T extends Record<string, unknown>>(
  {
    errors,
  }: {
    errors: FormikErrors<T>;
  },
  input: keyof T,
  data?: { __typename: string; errors?: { input: string; message: string }[] }
) => (
  <span color="red">
    {errors[input] ??
      (data?.errors ?? []).find((e) => e.input === input)?.message}
  </span>
);
