from sqlalchemy import text
from sqlalchemy.orm import Session


CRITICALITY_WEIGHT = {
    "low": 1,
    "medium": 2,
    "high": 4,
    "critical": 5,
}


class GraphService:
    def __init__(self, db: Session):
        self.db = db

    def get_asset_by_external_id(self, asset_ref: str) -> dict | None:
        rows = self.db.execute(
            text(
                """
                SELECT id, asset_name, asset_type, site_id, criticality, owner_team, dependency_json
                FROM assets
                """
            )
        ).mappings()
        matches: list[dict] = []
        for item in rows:
            dependency_json = item.get("dependency_json") or {}
            if isinstance(dependency_json, str):
                try:
                    dependency_json = __import__("json").loads(dependency_json)
                except __import__("json").JSONDecodeError:
                    dependency_json = {}
            asset_id_match = (
                isinstance(dependency_json, dict) and dependency_json.get("asset_id") == asset_ref
            )
            asset_name_match = item.get("asset_name") == asset_ref
            if asset_id_match or asset_name_match:
                matches.append(dict(item))

        if not matches:
            return None
        return max(matches, key=lambda item: int(item.get("id", 0)))

    def blast_radius_for_asset(self, asset_ref: str, max_depth: int = 5) -> list[dict]:
        asset = self.get_asset_by_external_id(asset_ref)
        if not asset:
            return []

        rows = self.db.execute(
            text(
                """
                WITH RECURSIVE blast_radius AS (
                    SELECT
                        ae.from_asset_id,
                        ae.to_asset_id,
                        ae.relationship,
                        ae.weight,
                        1 AS depth
                    FROM asset_edges ae
                    WHERE ae.from_asset_id = :asset_pk
                    UNION ALL
                    SELECT
                        ae.from_asset_id,
                        ae.to_asset_id,
                        ae.relationship,
                        ae.weight,
                        br.depth + 1
                    FROM asset_edges ae
                    JOIN blast_radius br ON ae.from_asset_id = br.to_asset_id
                    WHERE br.depth < :max_depth
                )
                SELECT
                    br.depth,
                    br.relationship,
                    br.weight,
                    a.id,
                    a.asset_name,
                    a.asset_type,
                    a.site_id,
                    a.criticality,
                    a.owner_team
                FROM blast_radius br
                JOIN assets a ON a.id = br.to_asset_id
                ORDER BY br.depth ASC, br.weight DESC, a.asset_name ASC
                """
            ),
            {"asset_pk": asset["id"], "max_depth": max_depth},
        ).mappings()
        return [dict(row) for row in rows]

    def criticality_score(self, blast_radius: list[dict]) -> float:
        if not blast_radius:
            return 0.2

        score = 0
        for item in blast_radius:
            score += CRITICALITY_WEIGHT.get(str(item.get("criticality", "medium")), 2)
        return min(1.0, score / 20)
