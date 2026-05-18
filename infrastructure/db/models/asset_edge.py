from sqlalchemy import Column, ForeignKey, Integer, JSON, String

from infrastructure.db.base import Base


class AssetEdge(Base):
    __tablename__ = "asset_edges"

    id = Column(Integer, primary_key=True, autoincrement=True)
    from_asset_id = Column(
        Integer, ForeignKey("assets.id", ondelete="CASCADE"), nullable=False, index=True
    )
    to_asset_id = Column(
        Integer, ForeignKey("assets.id", ondelete="CASCADE"), nullable=False, index=True
    )
    relationship = Column(String(100), nullable=False, index=True)
    weight = Column(Integer, default=1)
    metadata_json = Column(JSON, default=dict)
