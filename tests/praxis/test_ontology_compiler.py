from astraea.praxis.ontology_compiler import OntologyCompiler


def test_extract_object_candidates():
    compiler = OntologyCompiler()
    records = [
        {"site": "Georgia", "asset": "WEIFPS01", "source": "print_server"},
        {"site": "Texas", "asset": "TXPRT02", "source": "print_server"},
    ]
    candidates = compiler._extract_object_candidates(records)
    assert len(candidates) > 0
    assert any(c["value"] == "Georgia" for c in candidates)
    assert any(c["value"] == "WEIFPS01" for c in candidates)


def test_infer_object_types():
    compiler = OntologyCompiler()
    candidates = [
        {"key": "site", "value": "Georgia", "source": "print_server"},
        {"key": "asset", "value": "WEIFPS01", "source": "print_server"},
    ]
    objects = compiler._infer_object_types(candidates)
    assert len(objects) >= 1
    types = {o["type"] for o in objects}
    assert "Site" in types or "Asset" in types


def test_compile_returns_structure():
    compiler = OntologyCompiler()
    records = [
        {
            "site": "Georgia",
            "asset": "WEIFPS01",
            "event_type": "printer_failure",
            "description": "Printer mapping missing",
        },
    ]
    result = compiler.compile(records)
    assert "object_types" in result
    assert "links" in result
    assert "actions" in result
    assert "confidence" in result
    assert 0.0 <= result["confidence"] <= 1.0


def test_compile_with_empty_records():
    compiler = OntologyCompiler()
    result = compiler.compile([])
    assert result["object_count"] == 0
    assert result["confidence"] == 0.0
