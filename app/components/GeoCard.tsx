"use client";

import { useState } from "react";

import { useSupport } from "@/lib/useSupport";

import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { DataList } from "./ui/DataList";
import { Notice, type NoticeTone } from "./ui/Notice";

type PositionData = {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
};

type Feedback = { tone: NoticeTone; text: string };

const describeGeoError = (error: GeolocationPositionError): string => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Permission denied — allow location access for this origin and try again.";
    case error.POSITION_UNAVAILABLE:
      return "Position unavailable — the device could not determine a location.";
    case error.TIMEOUT:
      return "Timed out while waiting for a position fix.";
    default:
      return error.message || "Geolocation failed.";
  }
};

export const GeoCard = () => {
  const support = useSupport(() => "geolocation" in navigator);
  const [position, setPosition] = useState<PositionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const handleRequest = () => {
    if (!("geolocation" in navigator)) {
      setFeedback({ tone: "warn", text: "Geolocation is not supported in this browser." });
      return;
    }

    setLoading(true);
    setFeedback(null);

    navigator.geolocation.getCurrentPosition(
      (result) => {
        setPosition({
          latitude: result.coords.latitude,
          longitude: result.coords.longitude,
          accuracy: result.coords.accuracy,
          timestamp: result.timestamp,
        });
        setFeedback({ tone: "success", text: "Position acquired." });
        setLoading(false);
      },
      (error) => {
        setPosition(null);
        setFeedback({ tone: "danger", text: describeGeoError(error) });
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 },
    );
  };

  return (
    <Card
      index={5}
      title="Geolocation"
      api="navigator.geolocation"
      icon="geo"
      support={support}
      description="Request a one-shot position fix with high accuracy and inspect the reported coordinates and accuracy radius."
      footnote="Requires a secure origin; browsers only ask once per session and remember the answer per origin."
    >
      {position ? (
        <DataList
          items={[
            { label: "Latitude", value: position.latitude.toFixed(6) },
            { label: "Longitude", value: position.longitude.toFixed(6) },
            { label: "Accuracy", value: `${position.accuracy.toFixed(1)} m` },
            {
              label: "Timestamp",
              value: new Date(position.timestamp).toLocaleTimeString(),
            },
          ]}
        />
      ) : (
        <p className="rounded-lg border border-dashed border-line px-3 py-6 text-center font-mono text-xs text-muted">
          No position requested yet.
        </p>
      )}

      {support === "unsupported" ? (
        <Notice tone="warn">Geolocation is not available, so coordinates cannot be read.</Notice>
      ) : null}

      {feedback ? (
        <Notice tone={feedback.tone} announce>
          {feedback.text}
        </Notice>
      ) : null}

      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        <Button
          variant="primary"
          onClick={handleRequest}
          disabled={support !== "supported" || loading}
          aria-busy={loading}
        >
          {loading ? "Locating…" : "Get location"}
        </Button>
        {position ? (
          <Button variant="ghost" onClick={() => setPosition(null)}>
            Clear
          </Button>
        ) : null}
      </div>
    </Card>
  );
};
