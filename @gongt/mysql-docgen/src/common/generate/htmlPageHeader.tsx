import React from 'react';

declare const $: any;

function initScript() {
	function copy(message: string, sql: string) {
		$('#output').text(sql).focus()[0].select();
		const msg = document.execCommand('copy');
		console.log('Copying text command was ' + msg);

		$('#sqlTitle').text(msg ? '复制成功' : '复制失败');
		$('#sqlData').text(message);

		$('#toast').toast({ delay: 10000 }).toast('show');
	}
	$(document).on('click', '#copyAll', function () {
		const data = Array.from(
			$('.copyCode').map(function (this: any) {
				return $(this).text();
			})
		);
		copy(`复制了${data.length}条语句`, data.join('\n'));
	});
	$(document).on('dblclick', '.copyCode', function (this: HTMLElement) {
		const sql = $(this).text().trim();
		copy(sql, sql);
	});
}

export function htmlPage(title: string, body: React.ReactNode) {
	const toastStyle: React.CSSProperties = {
		position: 'fixed',
		left: '10px',
		top: '10px',
		zIndex: 100,
	};
	return (
		<React.Fragment>
			<html>
				<head>
					<title>{title}</title>
					<meta httpEquiv="content-type" content="text/html; charset=utf-8" />
					<link
						rel="stylesheet"
						href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"
						integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh"
						crossOrigin="anonymous"
					/>
					<script
						src="https://code.jquery.com/jquery-3.4.1.slim.min.js"
						integrity="sha384-J6qa4849blE2+poT4WnyKhv5vZF5SrPo0iEjwBvKU7imGFAV0wwj1yYfoRSJoZ+n"
						crossOrigin="anonymous"
					></script>
					<script
						src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js"
						integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo"
						crossOrigin="anonymous"
					></script>
					<script
						src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js"
						integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6"
						crossOrigin="anonymous"
					></script>
				</head>
				<body>
					<div id="toast" className="toast" role="alert" aria-live="assertive" aria-atomic="true" style={toastStyle}>
						<div className="toast-header">
							<img src="..." className="rounded mr-2" alt="..." />
							<strong id="sqlTitle" className="mr-auto"></strong>
							<small className="text-muted"></small>
							<button type="button" className="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
								<span aria-hidden="true">&times;</span>
							</button>
						</div>
						<div id="sqlData" className="toast-body"></div>
					</div>
					{body}
					<textarea id="output" style={{ opacity: 0, position: 'fixed', top: 0, zIndex: -1 }}></textarea>
				</body>

				<script type="text/javascript" dangerouslySetInnerHTML={{ __html: `(${initScript.toString()})();` }}></script>
			</html>
		</React.Fragment>
	);
}
