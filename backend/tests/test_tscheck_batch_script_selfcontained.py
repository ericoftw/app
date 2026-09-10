"""Criterion: POST /api/scripts/generate with script_type=batch returns a self-contained
.bat whose embedded base64 payload decodes back into the powershell runner."""
import base64
import re

from .conftest import api_url


def test_batch_script_is_self_contained_and_decodes_to_powershell(client):
    resp = client.post(
        api_url("/scripts/generate"),
        json={"wallpaper_id": "curated-1", "script_type": "batch"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()

    assert data["filename"].endswith(".bat")
    content = data["content"]
    assert "ExecutionPolicy Bypass" in content

    # Extract every `echo <chunk>` line written into the base64 payload file and decode it.
    chunks = re.findall(r'>>"%B64%" echo (\S+)', content)
    assert chunks, "no base64 payload lines found in batch script"
    b64 = "".join(chunks)
    decoded = base64.b64decode(b64).decode("utf-8")
    assert "GetWorkerW" in decoded
