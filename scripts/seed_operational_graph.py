from infrastructure.db.models.asset import Asset
from infrastructure.db.models.asset_edge import AssetEdge
from infrastructure.db.session import get_db_context, init_db


def upsert_asset(
    db,
    asset_name: str,
    asset_type: str,
    site_id: str,
    criticality: str,
    owner_team: str,
    dependency_json: dict,
) -> int:
    matches = (
        db.query(Asset)
        .filter(Asset.asset_name == asset_name)
        .order_by(Asset.id.desc())
        .all()
    )
    asset = matches[0] if matches else None
    if len(matches) > 1:
        keep_id = int(asset.id)
        db.query(AssetEdge).filter(AssetEdge.from_asset_id.in_([item.id for item in matches[1:]])).delete(
            synchronize_session=False
        )
        db.query(AssetEdge).filter(AssetEdge.to_asset_id.in_([item.id for item in matches[1:]])).delete(
            synchronize_session=False
        )
        db.query(Asset).filter(Asset.id.in_([item.id for item in matches[1:]])).delete(
            synchronize_session=False
        )
        db.flush()
        asset = db.query(Asset).filter(Asset.id == keep_id).one()

    if asset is None:
        asset = Asset(
            asset_name=asset_name,
            asset_type=asset_type,
            site_id=site_id,
            criticality=criticality,
            owner_team=owner_team,
            dependency_json=dependency_json,
        )
        db.add(asset)
        db.flush()
        return int(asset.id)

    asset.asset_type = asset_type
    asset.site_id = site_id
    asset.criticality = criticality
    asset.owner_team = owner_team
    asset.dependency_json = dependency_json
    db.flush()
    return int(asset.id)


def add_edge(db, from_id: int, to_id: int, relationship: str, weight: int) -> None:
    db.add(
        AssetEdge(
            from_asset_id=from_id,
            to_asset_id=to_id,
            relationship=relationship,
            weight=weight,
            metadata_json={},
        )
    )


def main() -> None:
    init_db()
    with get_db_context() as db:
        # Printer GPO drift assets
        weifps01 = upsert_asset(
            db, "WEIFPS01", "print_server", "TX", "high", "IT", {"asset_id": "printer.weifps01"}
        )
        zebra = upsert_asset(
            db,
            "Zebra Labeling",
            "service",
            "TX",
            "critical",
            "Operations",
            {"asset_id": "service.zebra_labeling"},
        )
        epicor = upsert_asset(
            db, "Epicor ERP", "erp", "TX", "critical", "Operations", {"asset_id": "system.epicor"}
        )
        production = upsert_asset(
            db,
            "Texas Production Line",
            "production_line",
            "TX",
            "critical",
            "Production",
            {"asset_id": "line.tx_production"},
        )
        shipping = upsert_asset(
            db,
            "Shipping Label Workflow",
            "business_process",
            "TX",
            "high",
            "Shipping",
            {"asset_id": "process.shipping_labels"},
        )

        # Network Edge Failover assets
        firewall = upsert_asset(
            db, "Firewall-EDGE-01", "firewall", "TX", "critical", "IT", {"asset_id": "firewall.edge_01"}
        )
        isp_primary = upsert_asset(
            db, "ISP-PRIMARY", "network", "TX", "high", "IT", {"asset_id": "network.isp_primary"}
        )
        starlink = upsert_asset(
            db, "Starlink-Backup-01", "network", "TX", "high", "IT", {"asset_id": "network.starlink_backup"}
        )

        # Identity Onboarding Drift assets
        ad = upsert_asset(
            db, "Active Directory", "identity_provider", "Global", "critical", "IT", {"asset_id": "auth.active_directory"}
        )

        # Database Replication Lag assets
        db_replica = upsert_asset(
            db, "asset-postgres-replica", "database", "Dallas", "critical", "SRE", {"asset_id": "database.postgres_replica"}
        )
        pgpool = upsert_asset(
            db, "asset-pgpool", "load_balancer", "Dallas", "high", "SRE", {"asset_id": "network.pgpool"}
        )
        checkout = upsert_asset(
            db,
            "Checkout Transactions Workflow",
            "business_process",
            "Dallas",
            "critical",
            "Operations",
            {"asset_id": "process.checkout_transactions"},
        )

        db.query(AssetEdge).delete()
        db.flush()

        # Printer relationships
        add_edge(db, weifps01, zebra, "supports", 5)
        add_edge(db, zebra, production, "supports", 5)
        add_edge(db, epicor, zebra, "depends_on", 4)
        add_edge(db, zebra, shipping, "supports", 4)

        # Network relationships
        add_edge(db, firewall, isp_primary, "depends_on", 5)
        add_edge(db, firewall, starlink, "depends_on", 4)
        add_edge(db, firewall, shipping, "supports", 4)

        # Identity relationships
        add_edge(db, ad, epicor, "supports", 5)
        add_edge(db, ad, weifps01, "supports", 4)

        # Database relationships
        add_edge(db, pgpool, db_replica, "supports", 5)
        add_edge(db, db_replica, checkout, "supports", 5)
        add_edge(db, epicor, db_replica, "depends_on", 4)
        
        db.commit()

    print("Seeded operational graph.")


if __name__ == "__main__":
    main()
