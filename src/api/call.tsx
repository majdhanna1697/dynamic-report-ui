import axios, { AxiosRequestConfig, Method } from "axios";
import config from "../config.json";

interface CallOptions<T = any> {
	method: Method;
	endpoint: string;
	request?: T;
	headers?: AxiosRequestConfig["headers"];
	signal?: AbortSignal;
	timeout?: number;
}

interface ApiError {
	message: string;
	status?: number;
	data?: any;
	isCanceled?: boolean;
}

export async function call<Response = any, Request = any>({ method, endpoint, request = {} as Request, headers = {}, signal, timeout }: CallOptions<Request>): Promise<Response> {
	const baseUrl = config.server_url.replace(/\/+$/, "");
	const fullEndpoint = endpoint.replace(/^\/+/, "");
	const url = `${baseUrl}/${fullEndpoint}`;

	const mergedHeaders = {
		"Content-Type": "application/json",
		...headers,
	};

	const axiosConfig: AxiosRequestConfig = {
		method,
		url,
		headers: mergedHeaders,
		signal,
		timeout,
	};

	if (method === "GET" || method === "DELETE") {
		axiosConfig.params = request;
	} else {
		axiosConfig.data = request;
	}

	try {
		const response = await axios(axiosConfig);
		return response.data;
	} catch (error: any) {
		if (axios.isCancel(error)) {
			throw {
				message: "Request was cancelled.",
				isCanceled: true,
			} as ApiError;
		}

		if (error?.response) {
			const { data, status, config: reqConfig } = error.response;
			const errorMessage = data?.errorMessage || `Request failed in ${data?.endpoint || reqConfig.url || endpoint}`;

			if (process.env.REACT_APP_ENV === "development") {
				console.error(`[API Error]: ${errorMessage}`, data);
			}

			throw {
				message: errorMessage,
				status,
				data,
			} as ApiError;
		}

		if (error.message === "Network Error") {
			throw {
				message: "Please check your internet connection and try again.",
			} as ApiError;
		}

		throw {
			message: "An unexpected error occurred. Please try again.",
		} as ApiError;
	}
}
