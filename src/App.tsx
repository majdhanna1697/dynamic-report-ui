import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.scss";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Home from "./pages/Home";
import SideBar from "./components/SideBar";
import { useDispatch, useSelector } from "react-redux";
import { themes } from "./assets/themes";
import "react-loading-skeleton/dist/skeleton.css";
import Login from "./pages/Login";
import { ThunkDispatch } from "redux-thunk";
import { user_initUser } from "./redux/actions/user";

function App() {
	const dispatch: ThunkDispatch<any, any, any> = useDispatch();

	const systemState = useSelector((state: any) => state.system);
	const userState = useSelector((state: any) => state.user);

	const [loadingApp, setLoadingApp] = useState(true);

	useEffect(() => {
		init();
	}, []);

	const init = async () => {
		await dispatch(user_initUser());
		setLoadingApp(false);
	};

	useEffect(() => {
		updateWebTheme(systemState.theme);
	}, [systemState.theme]);

	const updateWebTheme = (theme: "light" | "dark") => {
		if (!themes[theme]) {
			theme = "light";
			localStorage.setItem("theme", "light");
		}
		themes[theme].forEach(setCssVariable);
	};

	const setCssVariable = ([variable, value]) => {
		document.body.style.setProperty(variable, value);
	};

	return (
		<div className="App">
			{loadingApp ? (
				<label>loading</label>
			) : (
				<div className="app-page-container">
					{userState.accessToken && systemState.sideBarOpened && (
						<div className="app-page-container-left">
							<SideBar />
						</div>
					)}
					<div className="app-page-container-right" style={{ padding: systemState.sideBarOpened ? undefined : 0 }}>
						{userState.accessToken && <Header />}
						<div className="app-routes">
							<Routes>
								<Route path="/" element={userState.accessToken ? <Home /> : <Login />} />
								<Route path="*" element={<Navigate to="/" replace />} />
							</Routes>
						</div>
						{userState.accessToken && <Footer />}
					</div>
				</div>
			)}
		</div>
	);
}

export default App;
