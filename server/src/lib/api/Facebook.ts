import axios from "axios";
import { UserInfo } from "./types";

const GRAPH_BASE_URL = "https://graph.facebook.com/v9.0";

export const Facebook = {
  authUrl: `https://www.facebook.com/v9.0/dialog/oauth?client_id=${process.env.FB_CLIENT_ID}&redirect_uri=${process.env.PUBLIC_URL}/login/facebook&state=${process.env.FB_STATE}&scope=email`,
  login: async (code: string): Promise<UserInfo | null> => {
    const res = await axios.get(
      `${GRAPH_BASE_URL}/oauth/access_token?client_id=${process.env.FB_CLIENT_ID}&redirect_uri=${process.env.PUBLIC_URL}/login/facebook&client_secret=${process.env.FB_CLIENT_SECRET}&code=${code}`
    );
    const { access_token } = res.data;
    const { data } = await axios.get(`${GRAPH_BASE_URL}/me`, {
      params: {
        fields: "id,name,email,picture",
        access_token,
      },
    });
    if (!data) {
      return null;
    }
    return {
      userId: data.id ?? undefined,
      name: data.name ?? undefined,
      avatar: data.picture?.data?.url ?? undefined,
      contact: data.email ?? undefined,
    };
  },
};
