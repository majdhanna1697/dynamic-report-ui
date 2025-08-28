import React, { useEffect, useState, ChangeEvent } from "react";
import PageTitle from "src/components/PageTitle";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import MyTable, { TableColumn } from "src/components/MyTable";
import { call } from "src/api/call";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useSelector } from "react-redux";
import Config from "../../config.json";
import "./styles.scss";
import { enqueueSnackbar } from "notistack";

const DEFAULT_ROWS_PER_PAGE = 5;
const TABLE_ROWS_IN_PAGE_OPTIONS = [5, 10, 20, 50, 100, 250, 500, 1000];

export default function Home() {
	const userState = useSelector((state: any) => state.user);

	const [loadingReports, setLoadingReports] = useState(true);
	const [refreshingReports, setRefreshingReports] = useState(true);

	const [metrics, setMetrics] = useState([]);
	const [dimensions, setDimensions] = useState(["account_id", "campaign_id", "sys_creation_date"]);
	const [sortedColumn, setSortedColumn] = useState(null);
	const [sortDirection, setSortDirection] = useState(null);
	const [page, setPage] = useState(1);
	const storedTableSize = localStorage.getItem("tableSize");
	const [pageSize, setPageSize] = useState(storedTableSize ? Number(storedTableSize) : DEFAULT_ROWS_PER_PAGE);

	const [reportsResponse, setReportsResponse] = useState({});

	useEffect(() => {
		fetchReports();
	}, []);

	useEffect(() => {
		fetchReports(true);
	}, [page, pageSize, sortedColumn, sortDirection, metrics, dimensions]);

	const fetchReports = async (isRefreshing?: boolean) => {
		if (metrics?.length === 0 && dimensions?.length === 0) return;
		try {
			isRefreshing ? setRefreshingReports(true) : setLoadingReports(true);
			const request = {
				dimensions: dimensions,
				metrics: metrics,
				paging: {
					page: page,
					size: pageSize,
				},
				sorting: {
					field: sortedColumn,
					direction: sortDirection,
				},
			};
			const headers = {
				Authorization: `Bearer ${userState.accessToken}`,
			};
			const response = await call({ method: "POST", endpoint: "get-reports", request, headers });
			setReportsResponse(response);
		} catch (error: any) {
			const errorCode = error?.data?.errorCode;
			switch (errorCode) {
				default:
					enqueueSnackbar("Fetching report failed due to an unknown error.", { variant: "error" });
					break;
			}
		} finally {
			setLoadingReports(false);
			setRefreshingReports(false);
		}
	};

	const onPageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const newPageSize = Number(event.target.value);
		localStorage.setItem("tableSize", newPageSize.toString());
		setPageSize(newPageSize);
		setPage(1);
	};

	const goToPage = (page: number) => {
		setPage(page);
	};

	const onHeaderColumnSort = (column: string, direction: "asc" | "desc") => {
		setSortedColumn(column);
		setSortDirection(direction);
	};

	const extractData = (format: "csv" | "json" = "json", fileName: string = "report") => {
		let blob: Blob;

		const cleanData = reportsResponse.data.map((row) => Object.fromEntries(Object.entries(row).filter(([_, v]) => v !== null)));

		if (format === "csv") {
			const csvString = convertToCSV(cleanData);
			blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
		} else {
			const jsonString = JSON.stringify(cleanData, null, 2);
			blob = new Blob([jsonString], { type: "application/json;charset=utf-8;" });
		}

		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);
		link.href = url;
		link.setAttribute("download", `${fileName}.${format}`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	const convertToCSV = (data: any[]): string => {
		if (!data || !data.length) return "";

		const keys = Object.keys(data[0]);
		const csvRows = [keys.join(",")];

		data.forEach((row) => {
			const values = keys.map((key) => {
				let value = row[key] ?? "";
				if (typeof value === "string" && value.includes(",")) {
					value = `"${value}"`;
				}
				return value;
			});
			csvRows.push(values.join(","));
		});

		return csvRows.join("\n");
	};

	const handleMetricChange = (key: string, checked: boolean) => {
		setMetrics((prev) => (checked ? [...prev, key] : prev.filter((m) => m !== key)));
	};

	const handleDimensionChange = (key: string, checked: boolean) => {
		setDimensions((prev) => (checked ? [...prev, key] : prev.filter((d) => d !== key)));
	};

	const columns: TableColumn[] = [
		...(Config.metrics ?? []).map((metric: any) => {
			return { label: metric.label, key: metric.key, dbColumn: metric.dbColumn || null, type: metric.type };
		}),
		...(Config.dimensions ?? []).map((dimension: any) => {
			return { label: dimension.label, key: dimension.key, dbColumn: dimension.dbColumn || null, type: dimension.type };
		}),
	];

	const columnDbMap = Object.fromEntries(columns.map((col) => [col.key, col.dbColumn ?? col.key]));

	const sortableColumnKeys = [
		...(Config.metrics ?? []).filter((m) => m?.sortable).map((m) => columnDbMap[m.key] || m.key),
		...(Config.dimensions ?? []).filter((d) => d?.sortable).map((d) => columnDbMap[d.key] || d.key),
	];

	const visibleColumns = columns.filter((col) => metrics.includes(col.dbColumn || col.key) || dimensions.includes(col.dbColumn || col.key));

	return (
		<div className="app-page home">
			<PageTitle icon={<FormatListBulletedIcon />} title="Custom Reports" subtitle="Select the metrics and dimensions you want to analyze" />
			<div className="home-report-wrapper">
				<div className="home-report-left">
					<div className="home-report-filter">
						<p className="home-report-filter-title">Metrics</p>
						<div className="home-report-filter-options">
							{Config.metrics.map((metric: any, index) => (
								<div className="home-report-filter-option" key={metric.key}>
									<input
										className="report-filter-checkobx"
										type="checkbox"
										id={`metric_${index}`}
										checked={metrics.includes(metric.dbColumn || metric.key)}
										onChange={(e) => handleMetricChange(metric.dbColumn || metric.key, e.target.checked)}
									/>
									<label className="report-filter-label" htmlFor={`metric_${index}`}>
										{metric.label}
									</label>
								</div>
							))}
						</div>
					</div>

					<div className="home-report-filter">
						<p className="home-report-filter-title">Dimensions</p>
						<div className="home-report-filter-options">
							{Config.dimensions.map((dimension, index) => (
								<div className="home-report-filter-option" key={dimension.key}>
									<input
										className="report-filter-checkobx"
										type="checkbox"
										id={`dimension_${index}`}
										checked={dimensions.includes(dimension.dbColumn || dimension.key)}
										onChange={(e) => handleDimensionChange(dimension.dbColumn || dimension.key, e.target.checked)}
									/>
									<label className="report-filter-label" htmlFor={`dimension_${index}`}>
										{dimension.label}
									</label>
								</div>
							))}
						</div>
					</div>
				</div>
				{visibleColumns?.length > 0 ? (
					<MyTable
						columns={visibleColumns}
						data={reportsResponse?.data || []}
						rowKey="id"
						actionButtons={[
							{
								icon: <FileDownloadIcon />,
								label: "Export CSV",
								action: () => {
									extractData("csv");
								},
								disabled: loadingReports || refreshingReports || reportsResponse?.data?.length === 0,
							},
							{
								icon: <FileDownloadIcon />,
								label: "Export JSON",
								action: () => {
									extractData();
								},
								disabled: loadingReports || refreshingReports || reportsResponse?.data?.length === 0,
							},
						]}
						loading={loadingReports}
						refreshing={refreshingReports}
						onRefresh={() => fetchReports(true)}
						pageSize={pageSize}
						currentPage={page}
						totalPages={reportsResponse?.paging?.totalPages || 0}
						totalRows={reportsResponse?.paging?.totalRecords || 0}
						pageSizeOptions={TABLE_ROWS_IN_PAGE_OPTIONS}
						onPageSizeChange={onPageSizeChange}
						goToPage={goToPage}
						sortableColumnKeys={sortableColumnKeys}
						onHeaderColumnSort={onHeaderColumnSort}
						sortedColumn={sortedColumn}
						sortDirection={sortDirection}
					/>
				) : (
					<div className="nothing-to-show-wrapper">
						<label className="nothing-to-show-label">Nothing to show</label>
						<label className="nothing-to-show-label">Select the metrics and dimensions you want to see in the report.</label>
					</div>
				)}
			</div>
		</div>
	);
}
