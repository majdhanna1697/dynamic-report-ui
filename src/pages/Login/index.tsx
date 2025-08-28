import { useEffect, useState } from "react";
import "./styles.scss";
import MyInput from "src/components/MyInput";
import MyButton from "src/components/MyButton";
import { call } from "src/api/call";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { user_login } from "src/redux/actions/user";
import BrightnessIcon from "@mui/icons-material/Brightness4";
import { system_changeTheme } from "src/redux/actions/system";
import { enqueueSnackbar } from "notistack";
import Logo from "src/components/Logo";

interface Shape {
	id: number;
	top: number;
	left: number;
	size: number;
	delay: number;
	duration: number;
	rotation: number;
}

export default function Login() {
	const dispatch: ThunkDispatch<any, any, any> = useDispatch();

	const [shapes, setShapes] = useState<Shape[]>([]);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [loadingLogin, setLoadingLogin] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	useEffect(() => {
		const generateShapes = () => {
			const shapeCount = 10;
			const newShapes: Shape[] = [];

			for (let i = 0; i < shapeCount; i++) {
				newShapes.push({
					id: i,
					top: Math.random() * 100,
					left: Math.random() * 100,
					size: 60 + Math.random() * 100,
					delay: Math.random() * 10,
					duration: 30 + Math.random() * 40,
					rotation: Math.random() * 360,
				});
			}

			setShapes(newShapes);
		};

		generateShapes();
	}, []);

	const changeTheme = () => {
		dispatch(system_changeTheme());
	};

	useEffect(() => {
		setErrorMessage("");
	}, [username, password]);

	const onLogin = async (e) => {
		e.preventDefault();
		setLoadingLogin(true);
		try {
			const request = { username, password };
			const response = await call({ method: "POST", endpoint: "login", request });
			if (response.accessToken) {
				dispatch(user_login(response));
			}
		} catch (error: any) {
			const errorCode = error?.data?.errorCode;
			switch (errorCode) {
				case "DYNAMIC-REPORT-10000002":
				case "DYNAMIC-REPORT-10000006":
				case "DYNAMIC-REPORT-10000007":
				case "DYNAMIC-REPORT-VALIDATION-ERROR":
					setErrorMessage("Incorrect username or password.");
					break;
				case "DYNAMIC-REPORT-10000000":
					setErrorMessage("Account does not exist.");
					break;
				default:
					setErrorMessage("An unknown error occurred.");
					enqueueSnackbar("Login failed due to an unknown error.", { variant: "error" });
					break;
			}
		} finally {
			setLoadingLogin(false);
		}
	};

	return (
		<div className="login">
			<div className="abs-circles-container">
				<div className="abs-bg-circle" style={{ width: 800, height: 800, top: -250, left: -200, backgroundColor: "var(--primary)", opacity: 0.8 }} />
				<div className="abs-bg-circle" style={{ width: 500, height: 500, top: 300, left: -100, backgroundColor: "#ededed50" }} />
				<div className="abs-bg-circle" style={{ width: 400, height: 400, top: -100, right: -50, backgroundColor: "var(--primary)", opacity: 0.8 }} />
				<div className="abs-bg-circle" style={{ width: 200, height: 200, top: 200, right: -20, backgroundColor: "#b4b4b440" }} />
				<div className="abs-bg-circle" style={{ width: 600, height: 600, bottom: -250, right: 50, backgroundColor: "var(--primary)", opacity: 0.8 }} />
				<div className="abs-bg-circle" style={{ width: 400, height: 400, top: "50%", left: "50%", backgroundColor: "#ededed50" }} />
			</div>
			<div className="random-blur-shapes-wrapper">
				{shapes.map((shape) => (
					<div
						key={shape.id}
						className="blur-shape"
						style={{
							top: `${shape.top}%`,
							left: `${shape.left}%`,
							width: `${shape.size}px`,
							height: `${shape.size}px`,
							animationDelay: `${shape.delay}s`,
							animationDuration: `${shape.duration}s`,
							transform: `rotate(${shape.rotation}deg)`,
						}}
					/>
				))}
			</div>
			<div className="login-container">
				<div className="login-container-left">
					<p className="login-header-left-title">Dynamic Report UI</p>
					<form className="login-form" onSubmit={onLogin}>
						<div className="login-form-title-wrapper">
							<p className="login-form-title">Sign in to Dynamic Report UI</p>
							<p className="login-form-subtitle">Access your campaigns, reports, and analytics with your credentials</p>
						</div>
						<MyInput label="Username" style={{ backgroundColor: "var(--onBackground)" }} value={username} onChange={(e) => setUsername(e.target.value)} required />
						<MyInput
							label="Password"
							type="password"
							style={{ backgroundColor: "var(--onBackground)" }}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
						{errorMessage && <p className="login-error-message">{errorMessage}</p>}
						<div className="login-button-wrapper">
							<MyButton isLoading={loadingLogin} type="submit">
								Log in
							</MyButton>
						</div>
					</form>
					<div className="banner-connection-wrapper">
						<BrightnessIcon className="login-theme-toggle-button" onClick={changeTheme} />
					</div>
				</div>
				<div className="login-container-right">
					<div className="login-right-content-wrapper">
						<div className="login-right-content-container">
							<div className="login-right-content">
								<Logo />
								<div className="login-rgiht-title-wrapper">
									<p className="login-right-title">Dynamic Report UI</p>
									<p className="login-right-subtitle">Manage accounts, track campaigns, and view detailed reports in real time.</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
