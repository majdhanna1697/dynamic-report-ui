import Logo from "../Logo";
import "./styles.scss";
import CopyrightIcon from "@mui/icons-material/Copyright";

export default function Footer() {
	return (
		<div className="footer">
			<div className="footer-left">
				<p className="footer-rights-text">
					<CopyrightIcon className="footer-rights-icon" />
					Developed by <b>Majd Hanna</b>
				</p>
			</div>
			<div className="footer-right">
				<Logo />
			</div>
		</div>
	);
}
