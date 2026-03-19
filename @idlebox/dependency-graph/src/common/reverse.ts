import { DepGraph } from 'dependency-graph';

export function makeReverse<T>(graph: DepGraph<T>) {
	const reverse = new DepGraph<T>();

	for (const node of graph.overallOrder()) {
		reverse.addNode(node, graph.getNodeData(node));
	}

	for (const node of graph.overallOrder()) {
		for (const dep of graph.dependenciesOf(node)) {
			reverse.addDependency(dep, node);
		}
	}

	return reverse;
}
