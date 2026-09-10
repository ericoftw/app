"""Criterion: the video URL embedded in a generated script is absolute, points at the
public host, and is actually downloadable (200, video/* content-type)."""
import os

import httpx

from .conftest import api_url

PUBLIC_HOST = "wallpaper-engine-pro.preview.emergentagent.com"


def test_media_url_is_absolute_public_and_downloadable(client):
    resp = client.post(
        api_url("/scripts/generate"),
        json={"wallpaper_id": "curated-1", "script_type": "powershell"},
        headers={"host": PUBLIC_HOST, "x-forwarded-host": PUBLIC_HOST, "x-forwarded-proto": "https"},
    )
    assert resp.status_code == 200, resp.text
    metadata = resp.json()["metadata"]
    media_url = metadata["media_url"]

    assert media_url.startswith(f"https://{PUBLIC_HOST}"), media_url

    # Fetch the asset from the real public ingress (not localhost) — this is exactly what a
    # Windows machine running the generated script would do.
    video_resp = httpx.get(media_url, timeout=30.0, follow_redirects=True)
    assert video_resp.status_code == 200, f"GET {media_url} -> {video_resp.status_code}"
    content_type = video_resp.headers.get("content-type", "")
    assert content_type.startswith("video/"), f"unexpected content-type {content_type!r}"
