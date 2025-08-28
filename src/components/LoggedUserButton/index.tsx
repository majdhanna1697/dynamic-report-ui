import "./styles.scss";
import { getContrastColor, stringToColor } from "src/assets/helpers/colors";
import { useDispatch, useSelector } from "react-redux";
import LogoutIcon from "@mui/icons-material/Logout";
import { useEffect, useRef, useState } from "react";
import { ThunkDispatch } from "redux-thunk";
import { user_logout } from "src/redux/actions/user";
import React from "react";

interface menuButtonProps {
	label: string;
	icon?: React.ReactNode;
	action: () => void;
}

export default function LoggedUserButton() {
	const dispatch: ThunkDispatch<any, any, any> = useDispatch();

	const userState = useSelector((state: any) => state.user);
	const bgColor = stringToColor(userState.username);
	const contrastColor = getContrastColor(bgColor);

	const menuRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const [menuVisible, setMenuVisible] = useState(false);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node) && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
				setMenuVisible(false);
			}
		};

		document.addEventListener("click", handleClickOutside);
		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	}, []);

	const toggleMenu = () => {
		setMenuVisible((prev) => !prev);
	};

	const menuButtons: Array<menuButtonProps[]> = [
		[
			{
				label: "Logout",
				icon: <LogoutIcon className="logged-user-menu-button-icon" />,
				action: () => {
					dispatch(user_logout());
				},
			},
		],
	];

	return (
		<div className="logged-user-button-container">
			<button ref={buttonRef} className="logged-user-button" style={{ backgroundColor: bgColor, color: contrastColor }} onClick={toggleMenu}>
				{userState.username.slice(0, 2).toUpperCase()}
			</button>

			<div ref={menuRef} className={`logged-user-button-menu ${menuVisible ? "visible" : ""}`}>
				<div className="logged-user-menu-user-info">
					<div className="logged-user-menu-user-info-circle" style={{ backgroundColor: bgColor, color: contrastColor }}>
						{userState.username.slice(0, 2).toUpperCase()}
					</div>
					<table style={{ borderSpacing: 0 }}>
						<tbody>
							<tr>
								<td>
									<label className="logged-user-menu-user-info-label">Username</label>
								</td>
								<td>
									<label className="logged-user-menu-user-info-value">{userState.username}</label>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				{menuButtons.map((group, index) => (
					<div key={index} className="logged-user-menu-group-buttons">
						{group.map((button, btnIndex) => (
							<button key={btnIndex} className="logged-user-menu-btn" onClick={button.action}>
								{button.icon}
								<label className="logged-user-menu-button-label">{button.label}</label>
							</button>
						))}
					</div>
				))}
			</div>
		</div>
	);
}
