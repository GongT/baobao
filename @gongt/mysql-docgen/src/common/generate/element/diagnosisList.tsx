import * as React from 'react';
import { diagnosisMessage, getAllDiagnosis } from '../../library/diagnosis';

export class DiagnosisList extends React.PureComponent {
	private renderList() {
		const list = getAllDiagnosis();

		if (list.length === 0) {
			return (
				<div className="alert alert-success" role="alert">
					好耶，没有发现问题！
				</div>
			);
		} else {
			return (
				<React.Fragment>
					<div style={{ display: 'flex', justifyContent: 'end' }}>
						<button id="copyAll" type="button" className="btn btn-primary">
							全部复制
						</button>
					</div>
					<div>&nbsp;</div>
					{list.map(({ message, isWarn, todo }, index) => this.renderLine(index, message, todo, isWarn))}
				</React.Fragment>
			);
		}
	}

	render() {
		const { warns, errors } = diagnosisMessage();
		return (
			<div className="p-2">
				<div className="accordion" id="accordionExample">
					<div className="card" style={{ overflow: 'visible' }}>
						<div className="card-header" id="headingOne">
							<h5
								className="mb-0"
								data-toggle="collapse"
								data-target="#collapseOne"
								aria-expanded="false"
								aria-controls="collapseOne"
								style={{ cursor: 'pointer' }}
							>
								<svg
									className="bi bi-x-octagon-fill error"
									width="1em"
									height="1em"
									viewBox="0 0 20 20"
									fill="currentColor"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										fillRule="evenodd"
										d="M13.46 2.146A.5.5 0 0013.107 2H6.893a.5.5 0 00-.353.146L2.146 6.54A.5.5 0 002 6.893v6.214a.5.5 0 00.146.353l4.394 4.394a.5.5 0 00.353.146h6.214a.5.5 0 00.353-.146l4.394-4.394a.5.5 0 00.146-.353V6.893a.5.5 0 00-.146-.353L13.46 2.146zm-6.106 4.5L10 9.293l2.646-2.647a.5.5 0 01.708.708L10.707 10l2.647 2.646a.5.5 0 01-.708.708L10 10.707l-2.646 2.647a.5.5 0 01-.708-.708L9.293 10 6.646 7.354a.5.5 0 11.708-.708z"
										clipRule="evenodd"
									></path>
								</svg>
								{errors > 1 ? errors + ' errors' : errors + ' error'},
								<svg
									className="bi bi-alert-octagon-fill"
									width="1em"
									height="1em"
									viewBox="0 0 20 20"
									fill="currentColor"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										fillRule="evenodd"
										d="M13.107 2a.5.5 0 01.353.146l4.394 4.394a.5.5 0 01.146.353v6.214a.5.5 0 01-.146.353l-4.394 4.394a.5.5 0 01-.353.146H6.893a.5.5 0 01-.353-.146L2.146 13.46A.5.5 0 012 13.107V6.893a.5.5 0 01.146-.353L6.54 2.146A.5.5 0 016.893 2h6.214zM9.002 13a1 1 0 112 0 1 1 0 01-2 0zM10 6a.905.905 0 00-.9.995l.35 3.507a.553.553 0 001.1 0l.35-3.507A.905.905 0 0010 6z"
										clipRule="evenodd"
									></path>
								</svg>
								{warns > 1 ? warns + ' warnings' : warns + ' warning'},
							</h5>
						</div>

						<div className="position-relative">
							<div
								id="collapseOne"
								className="collapse p-2 border border-top-0 position-absolute bg-light"
								aria-labelledby="headingOne"
								data-parent="#accordionExample"
								style={{ width: '100%', zIndex: 99 }}
							>
								{this.renderList()}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	private renderLine(index: number, message: string, todo: string, isWarn: boolean): any {
		const cls = 'alert alert-' + (isWarn ? 'warning' : 'danger');
		return (
			<div key={index + ''} className={cls} role="alert">
				{message}
				{todo ? (
					<code
						className="copyCode"
						style={{
							userSelect: 'none',
							float: 'right',
							maxWidth: '60%',
							overflow: 'auto',
							whiteSpace: 'pre-wrap',
						}}
					>
						{todo}
					</code>
				) : null}
				<div className="clearfix"></div>
			</div>
		);
	}
}
