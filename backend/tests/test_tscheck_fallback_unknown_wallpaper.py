"""Negative case: an unknown wallpaper_id must still return 200 with a valid fallback
script instead of a 500 error."""
from .conftest import api_url


def test_unknown_wallpaper_id_returns_fallback_script(client):
    resp = client.post(
        api_url("/scripts/generate"),
        json={"wallpaper_id": "tscheck-nonexistent-wallpaper-xyz", "script_type": "powershell"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["download_ready"] is True
    assert "GetWorkerW" in data["content"]
    assert data["metadata"]["media_url"]
