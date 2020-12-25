import { google } from 'googleapis';
import { UserInfo } from '../types';

const auth = new google.auth.OAuth2(
  process.env.G_CLIENT_ID,
  process.env.G_CLIENT_SECRET,
  `${process.env.PUBLIC_URL}/login/google`
);

export const Google = {
  authUrl: auth.generateAuthUrl({
    access_type: 'online',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
  }),
  logIn: async (code: string): Promise<UserInfo | null> => {
    const { tokens } = await auth.getToken(code);
    auth.setCredentials(tokens);
    const { data } = await google.people({ version: 'v1', auth }).people.get({
      resourceName: 'people/me',
      personFields: 'emailAddresses,names,photos',
    });
    if (!data) {
      return null;
    }
    const userNamesList = data.names && data.names.length ? data.names : null;
    const userPhotosList =
      data.photos && data.photos.length ? data.photos : null;
    const userEmailsList =
      data.emailAddresses && data.emailAddresses.length
        ? data.emailAddresses
        : null;
    const userId = userNamesList?.[0]?.metadata?.source?.id;
    return {
      _id: userId ? `gg_${userId}` : null,
      name: userNamesList?.[0].displayName ?? null,
      avatar: userPhotosList?.[0].url ?? null,
      contact: userEmailsList?.[0].value ?? null,
    };
  },
};
