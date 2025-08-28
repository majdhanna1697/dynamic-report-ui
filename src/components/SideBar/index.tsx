import "./styles.scss";
import HomeIcon from "@mui/icons-material/Home";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import SideBarButton, { SideBarButtonProps } from "../SideBarButton";
import { useSelector } from "react-redux";
import Logo from "../Logo";

export default function SideBar() {
	const systemState = useSelector((state: any) => state.system);

	const sideBarButtons: Array<SideBarButtonProps[]> = [
		[
			{
				label: "Home",
				icon: <HomeIcon className="side-bar-button-icon" />,
				path: "/",
			},
		],
		// [
		// 	{
		// 		label: "Guides",
		// 		icon: <ChecklistIcon className="side-bar-button-icon" />,
		// 		options: [
		// 			{ label: "Setup Steps", path: `/` },
		// 			{ label: "Production Improvements", path: `/` },
		// 		],
		// 	},
		// ],
		[
			{
				label: "My LinkedIn",
				icon: <LinkedInIcon className="side-bar-button-icon" />,
				path: "https://il.linkedin.com/in/majd-hanna",
				newTab: true,
				external: true,
			},
		],
	];

	return (
		<div className="side-bar">
			<div className="side-bar-logo-wrapper">
				<Logo />
			</div>
			<div className="side-bar-button-container">
				{sideBarButtons.map((sideBarSection, s) => (
					<div key={s} className="side-bar-buttons-section">
						{sideBarSection.map((button, b) => (
							<SideBarButton
								key={b}
								icon={button.icon}
								label={button.label}
								options={button.options}
								path={button.path}
								newTab={button.newTab}
								external={button.external}
							/>
						))}
					</div>
				))}
			</div>
		</div>
	);
}
