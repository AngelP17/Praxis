from pathlib import Path

import pytest
import yaml

from astraea.praxis import RoiCalculator
from astraea.praxis.roi_calculator import RoiFormulaError


ROOT = Path(__file__).resolve().parents[2]


def load_roi(pack_id: str) -> dict:
    return yaml.safe_load((ROOT / "solution-packs" / pack_id / "roi-model.yaml").read_text())


def test_roi_calculator_evaluates_formula_dependencies():
    roi = RoiCalculator().calculate(load_roi("manufacturing-printer-gpo"))

    assert roi["calculations"]["monthly_labor_cost_saved"] == 316.8
    assert roi["calculations"]["monthly_delay_cost_avoided"] == 1750.0
    assert roi["calculations"]["annual_value"] == 24801.6
    assert roi["estimated_annual_value"] == 38481.6


def test_roi_calculator_rejects_unsafe_expression():
    model = {
        "variables": {"x": 1},
        "formulas": {"annual_value": {"expression": "__import__('os').system('echo nope')"}},
    }

    with pytest.raises(RoiFormulaError):
        RoiCalculator().calculate(model)

