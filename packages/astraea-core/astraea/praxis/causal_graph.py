class CausalGraph:
    def __init__(self):
        self.nodes: dict[str, dict] = {}
        self.edges: list[tuple[str, str, str]] = []

    def add_node(self, node_id: str, node_type: str, properties: dict = None):
        self.nodes[node_id] = {
            "node_id": node_id,
            "node_type": node_type,
            "properties": properties or {},
        }

    def add_edge(self, source: str, target: str, edge_type: str):
        self.edges.append((source, target, edge_type))

    def dependency_centrality(self, node_id: str, ontology: dict | None = None) -> float:
        if node_id not in self.nodes:
            return 0.5

        in_degree = sum(1 for _, t, _ in self.edges if t == node_id)
        out_degree = sum(1 for s, _, _ in self.edges if s == node_id)

        total = in_degree + out_degree
        if total == 0:
            return 0.3

        return min(round(0.3 + 0.07 * total, 4), 1.0)
