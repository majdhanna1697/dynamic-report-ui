import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { call } from "src/api/call";

export const user_initUser = (): ThunkAction<Promise<void>, any, any, any> => {
	return async (dispatch: ThunkDispatch<any, any, any>) => {
		const accessToken = localStorage.getItem("accessToken");

		if (!accessToken) return;

		const headers = {
			Authorization: `Bearer ${accessToken}`,
		};

		try {
			const response = await call({
				method: "POST",
				endpoint: "login",
				headers,
			});
			dispatch(user_login(response));
		} catch (error) {
			dispatch(user_logout());
		}
	};
};

export const user_login = (user: any) => {
	localStorage.setItem("accessToken", user.accessToken);
	return {
		type: "USER_LOGIN",
		payload: { user },
	};
};

export const user_logout = () => {
	localStorage.removeItem("accessToken");
	return {
		type: "USER_LOGOUT",
	};
};
