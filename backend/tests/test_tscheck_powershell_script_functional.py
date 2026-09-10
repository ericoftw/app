"""Criterion: POST /api/scripts/generate with script_type=powershell returns a genuinely
functional Windows runner script (WorkerW hook, download, MediaElement playback, Stop action)."""
from .conftest import api_url


def test_powershell_script_is_functional(client):
    payload = {"wallpaper_id": "curated-1", "script_type": "powershell"}
    resp = client.post(api_url("/scripts/generate"), json=payload)
    assert resp.status_code == 200, resp.text
    data = resp.json()

    assert data["script_type"] == "powershell"
    assert data["filename"].endswith(".ps1")

    content = data["content"]
    for marker in ("GetWorkerW", "Invoke-WebRequest", "MediaElement", "Dispatcher]::Run"):
        assert marker in content, f"missing marker {marker!r} in generated powershell content"

    assert "-Action Stop" in content
    assert "ValidateSet('Start','Stop')" in content
