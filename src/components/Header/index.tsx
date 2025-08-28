import { useDispatch, useSelector } from "react-redux";
import LoggedUserButton from "../LoggedUserButton";
import BrightnessIcon from "@mui/icons-material/Brightness4";
import "./styles.scss";
import { ThunkDispatch } from "redux-thunk";
import { system_changeTheme, system_toggleSideBar } from "../../redux/actions/system";
import Logo from "../Logo";
import MenuIcon from "@mui/icons-material/Menu";

export default function Header() {
	const dispatch: ThunkDispatch<any, any, any> = useDispatch();
	const systemState = useSelector((state: any) => state.system);

	const changeTheme = () => {
		dispatch(system_changeTheme());
	};

	const toggleSideBar = () => {
		dispatch(system_toggleSideBar());
	};

	return (
		<div className="header">
			<div className="header-container">
				<div className="header-container-left">
					<MenuIcon className="toggle-side-bar-button" onClick={toggleSideBar} />
					<Logo />
				</div>
				<div className="header-container-right">
					<LoggedUserButton />
					<BrightnessIcon className="header-theme-toggle-button" onClick={changeTheme} />
				</div>
			</div>
		</div>
	);
}
