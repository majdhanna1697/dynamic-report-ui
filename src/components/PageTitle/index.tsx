import "./styles.scss";
import { cloneElement, ReactElement } from "react";

interface PageTitleProps {
	icon?: ReactElement<any>;
	title: string;
	subtitle?: string;
}

export default function PageTitle(props: PageTitleProps) {
	const { icon, title, subtitle } = props;

	return (
		<div className="page-title-container">
			<div className="page-title-row">
				{icon && <div>{icon && cloneElement(icon, { className: "page-title-icon" })}</div>}
				<label className="page-title-title">{title}</label>
			</div>
			{subtitle && <label className="page-title-subtitle">{subtitle}</label>}
		</div>
	);
}
