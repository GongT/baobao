/** @innternal */
export const spinner = {
	interval: 17,
	frames: [
		'█▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁',
		'██▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁',
		'███▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁',
		'████▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁',
		'██████▁▁▁▁▁▁▁▁▁▁▁▁▁▁',
		'██████▁▁▁▁▁▁▁▁▁▁▁▁▁▁',
		'███████▁▁▁▁▁▁▁▁▁▁▁▁▁',
		'████████▁▁▁▁▁▁▁▁▁▁▁▁',
		'█████████▁▁▁▁▁▁▁▁▁▁▁',
		'█████████▁▁▁▁▁▁▁▁▁▁▁',
		'██████████▁▁▁▁▁▁▁▁▁▁',
		'███████████▁▁▁▁▁▁▁▁▁',
		'█████████████▁▁▁▁▁▁▁',
		'██████████████▁▁▁▁▁▁',
		'██████████████▁▁▁▁▁▁',
		'▁██████████████▁▁▁▁▁',
		'▁██████████████▁▁▁▁▁',
		'▁██████████████▁▁▁▁▁',
		'▁▁██████████████▁▁▁▁',
		'▁▁▁██████████████▁▁▁',
		'▁▁▁▁█████████████▁▁▁',
		'▁▁▁▁██████████████▁▁',
		'▁▁▁▁██████████████▁▁',
		'▁▁▁▁▁██████████████▁',
		'▁▁▁▁▁██████████████▁',
		'▁▁▁▁▁██████████████▁',
		'▁▁▁▁▁▁██████████████',
		'▁▁▁▁▁▁██████████████',
		'▁▁▁▁▁▁▁█████████████',
		'▁▁▁▁▁▁▁█████████████',
		'▁▁▁▁▁▁▁▁████████████',
		'▁▁▁▁▁▁▁▁████████████',
		'▁▁▁▁▁▁▁▁▁███████████',
		'▁▁▁▁▁▁▁▁▁███████████',
		'▁▁▁▁▁▁▁▁▁▁██████████',
		'▁▁▁▁▁▁▁▁▁▁██████████',
		'▁▁▁▁▁▁▁▁▁▁▁▁████████',
		'▁▁▁▁▁▁▁▁▁▁▁▁▁███████',
		'▁▁▁▁▁▁▁▁▁▁▁▁▁▁██████',
		'▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█████',
		'▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█████',
		'█▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁████',
		'██▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁███',
		'██▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁███',
		'███▁▁▁▁▁▁▁▁▁▁▁▁▁▁███',
		'████▁▁▁▁▁▁▁▁▁▁▁▁▁▁██',
		'█████▁▁▁▁▁▁▁▁▁▁▁▁▁▁█',
		'█████▁▁▁▁▁▁▁▁▁▁▁▁▁▁█',
		'██████▁▁▁▁▁▁▁▁▁▁▁▁▁█',
		'████████▁▁▁▁▁▁▁▁▁▁▁▁',
		'█████████▁▁▁▁▁▁▁▁▁▁▁',
		'█████████▁▁▁▁▁▁▁▁▁▁▁',
		'█████████▁▁▁▁▁▁▁▁▁▁▁',
		'█████████▁▁▁▁▁▁▁▁▁▁▁',
		'███████████▁▁▁▁▁▁▁▁▁',
		'████████████▁▁▁▁▁▁▁▁',
		'████████████▁▁▁▁▁▁▁▁',
		'██████████████▁▁▁▁▁▁',
		'██████████████▁▁▁▁▁▁',
		'▁██████████████▁▁▁▁▁',
		'▁██████████████▁▁▁▁▁',
		'▁▁▁█████████████▁▁▁▁',
		'▁▁▁▁▁████████████▁▁▁',
		'▁▁▁▁▁████████████▁▁▁',
		'▁▁▁▁▁▁███████████▁▁▁',
		'▁▁▁▁▁▁▁▁█████████▁▁▁',
		'▁▁▁▁▁▁▁▁█████████▁▁▁',
		'▁▁▁▁▁▁▁▁▁█████████▁▁',
		'▁▁▁▁▁▁▁▁▁█████████▁▁',
		'▁▁▁▁▁▁▁▁▁▁█████████▁',
		'▁▁▁▁▁▁▁▁▁▁▁████████▁',
		'▁▁▁▁▁▁▁▁▁▁▁████████▁',
		'▁▁▁▁▁▁▁▁▁▁▁▁███████▁',
		'▁▁▁▁▁▁▁▁▁▁▁▁███████▁',
		'▁▁▁▁▁▁▁▁▁▁▁▁▁███████',
		'▁▁▁▁▁▁▁▁▁▁▁▁▁███████',
		'▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█████',
		'▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁████',
		'▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁████',
		'▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁████',
		'▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁███',
		'▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁███',
		'▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁██',
		'▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁██',
		'▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁██',
		'▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█',
		'▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█',
		'▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█',
		'▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁',
		'▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁',
		'▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁',
		'▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁',
	],
};
