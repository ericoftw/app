"""Criterion: lively_zip and wallpaper_engine_json script types keep returning valid,
parseable manifests with non-empty instructions."""
import json

import pytest

from .conftest import api_url


@pytest.mark.parametrize("script_type", ["lively_zip", "wallpaper_engine_json"])
def test_manifest_script_types_return_parseable_json(client, script_type):
    resp = client.post(
        api_url("/scripts/generate"),
        json={"wallpaper_id": "curated-1", "script_type": script_type},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()

    parsed = json.loads(data["content"])
    assert isinstance(parsed, dict) and parsed, "manifest content did not parse to a non-empty object"
    assert data["instructions"], "instructions list must not be empty"
