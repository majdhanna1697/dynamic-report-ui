import { NavLink, useLocation } from "react-router-dom";
import "./styles.scss";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LaunchIcon from "@mui/icons-material/Launch";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

export interface SideBarButtonProps {
	key?: React.Key;
	label: string;
	icon: React.ReactNode;
	path?: string;
	options?: SideBarButtonOptionsProps[];
	newTab?: boolean;
	external?: boolean;
}

interface SideBarButtonOptionsProps {
	label: string;
	path?: string;
}

export default function SideBarButton(props: SideBarButtonProps) {
	const { label, icon, path, options, external, newTab } = props;
	const location = useLocation();
	const systemState = useSelector((state: any) => state.system);

	const [isActive, setIsActive] = useState(false);
	const [activeOptionIndex, setActiveOptionIndex] = useState(-1);
	const [showOptions, setShowOptions] = useState(false);
	const optionsRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = optionsRef.current;
		if (!el) return;

		if (showOptions) {
			el.style.maxHeight = el.scrollHeight + "px";
			const onTransitionEnd = () => {
				el.style.maxHeight = "none";
			};
			el.addEventListener("transitionend", onTransitionEnd, { once: true });
		} else {
			el.style.maxHeight = el.scrollHeight + "px";
			window.getComputedStyle(el).maxHeight;
			el.style.maxHeight = "0px";
		}
	}, [showOptions]);

	useEffect(() => {
		checkActiveButton();
	}, [location.pathname, systemState.environment]);

	const checkActiveButton = () => {
		if (options) {
			setIsActive(options && options.some((option) => location.pathname.startsWith(option.path)));
			setActiveOptionIndex(options.findIndex((option) => location.pathname.startsWith(option.path)));
		} else {
			setIsActive(location.pathname === path);
		}
	};

	return (
		<div className="side-bar-button-wrapper">
			{options ? (
				<div className="side-bar-button-wrapper">
					<button className={`side-bar-button ${showOptions ? "open" : ""} ${isActive ? "active-btn" : ""}`} onClick={() => setShowOptions(!showOptions)}>
						<div className="side-bar-button-left">
							<div className="side-bar-button-icon-wrapper">{icon}</div>
							<label className="side-bar-button-label">{label}</label>
						</div>
						<div className="side-bar-button-right">
							<KeyboardArrowDownIcon className={showOptions ? "side-bar-options-arrow-icon open" : "side-bar-options-arrow-icon"} />
						</div>
					</button>
					<div ref={optionsRef} className="side-bar-button-options">
						{options.map((option, index) => (
							<NavLink key={index} className={`side-bar-button-option ${activeOptionIndex === index ? "active-btn" : ""}`} to={option.path}>
								<div className="side-bar-button-option-left">
									<div className="side-bar-option-dot"></div>
								</div>
								<div className="side-bar-button-option-right">
									<label className="side-bar-button-option-label">{option.label}</label>
								</div>
							</NavLink>
						))}
					</div>
				</div>
			) : external ? (
				<a className="side-bar-button" href={path} target={newTab ? "_blank" : ""} rel="noopener noreferrer">
					<div className="side-bar-button-left">
						<div className="side-bar-button-icon-wrapper">{icon}</div>
						<label className="side-bar-button-label">{label}</label>
					</div>
					<div className="side-bar-button-right">
						<LaunchIcon className="side-bar-options-arrow-icon" style={{ width: 14, height: 14 }} />
					</div>
				</a>
			) : (
				<NavLink className={`side-bar-button ${isActive ? "active-btn" : ""}`} to={path}>
					<div className="side-bar-button-icon-wrapper">{icon}</div>
					<label className="side-bar-button-label">{label}</label>
				</NavLink>
			)}
		</div>
	);
}
