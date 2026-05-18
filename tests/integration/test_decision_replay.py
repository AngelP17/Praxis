from domain.events import printer_offline_event
from infrastructure.db.base import Base
from infrastructure.db.models.asset import Asset
from infrastructure.db.models.asset_edge import AssetEdge
from infrastructure.db.session import _import_models
from tests.integration.test_flagship_path import TestingSessionLocal, client, engine


def seed_graph() -> None:
    _import_models()
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        db.query(AssetEdge).delete()
        db.query(Asset).delete()
        db.flush()

        printer = Asset(
            asset_name="WEIFPS01",
            asset_type="print_server",
            site_id="TX",
            criticality="high",
            owner_team="IT",
            dependency_json={"asset_id": "printer.weifps01"},
        )
        zebra = Asset(
            asset_name="Zebra Labeling",
            asset_type="service",
            site_id="TX",
            criticality="critical",
            owner_team="Operations",
            dependency_json={"asset_id": "service.zebra_labeling"},
        )
        production = Asset(
            asset_name="Texas Production Line",
            asset_type="production_line",
            site_id="TX",
            criticality="critical",
            owner_team="Production",
            dependency_json={"asset_id": "line.tx_production"},
        )
        shipping = Asset(
            asset_name="Shipping Label Workflow",
            asset_type="business_process",
            site_id="TX",
            criticality="high",
            owner_team="Shipping",
            dependency_json={"asset_id": "process.shipping_labels"},
        )
        db.add_all([printer, zebra, production, shipping])
        db.flush()

        db.add_all(
            [
                AssetEdge(
                    from_asset_id=printer.id,
                    to_asset_id=zebra.id,
                    relationship="supports",
                    weight=5,
                    metadata_json={},
                ),
                AssetEdge(
                    from_asset_id=zebra.id,
                    to_asset_id=production.id,
                    relationship="supports",
                    weight=5,
                    metadata_json={},
                ),
                AssetEdge(
                    from_asset_id=zebra.id,
                    to_asset_id=shipping.id,
                    relationship="supports",
                    weight=4,
                    metadata_json={},
                ),
            ]
        )
        db.commit()
    finally:
        db.close()


def test_graph_aware_replay_is_deterministic():
    seed_graph()
    payload = printer_offline_event().model_dump(mode="json")

    create_response = client.post("/api/decisions/evaluate", json=payload)
    assert create_response.status_code == 200
    decision_id = create_response.json()["id"]

    approve_response = client.post(
        f"/api/decisions/{decision_id}/approve", json={"note": "Operator approved"}
    )
    assert approve_response.status_code == 200

    replay_response = client.post(f"/api/decisions/{decision_id}/replay")
    assert replay_response.status_code == 200
    replay_payload = replay_response.json()
    assert replay_payload["determinism"] is True
    assert replay_payload["stored_replay_hash"] == replay_payload["replayed_hash"]
