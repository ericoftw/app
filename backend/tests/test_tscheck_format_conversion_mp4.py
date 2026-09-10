"""Criterion: formats unsupported by Windows MediaElement (webm, mkv) are swapped for
their MP4 sibling in the generated script's media_url."""
import pytest

from .conftest import api_url


@pytest.mark.parametrize("wallpaper_id", ["curated-11", "curated-12"])
def test_unsupported_format_converted_to_mp4(client, wallpaper_id):
    resp = client.post(
        api_url("/scripts/generate"),
        json={"wallpaper_id": wallpaper_id, "script_type": "powershell"},
    )
    assert resp.status_code == 200, resp.text
    media_url = resp.json()["metadata"]["media_url"]
    assert media_url.endswith(".mp4"), f"{wallpaper_id} media_url not converted to mp4: {media_url}"
