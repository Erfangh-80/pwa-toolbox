"use client";

import { useFormatter, useTranslations } from "next-intl";
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

export const GeoCard = () => {
  const t = useTranslations("cards.geo");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const support = useSupport(() => "geolocation" in navigator);
  const [position, setPosition] = useState<PositionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const describeGeoError = (error: GeolocationPositionError): string => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return t("errorDenied");
      case error.POSITION_UNAVAILABLE:
        return t("errorUnavailable");
      case error.TIMEOUT:
        return t("errorTimeout");
      default:
        return error.message || t("errorGeneric");
    }
  };

  const handleRequest = () => {
    if (!("geolocation" in navigator)) {
      setFeedback({ tone: "warn", text: t("noticeUnsupported") });
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
        setFeedback({ tone: "success", text: t("acquired") });
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
    <Card index={5} namespace="cards.geo" api="navigator.geolocation" icon="geo" support={support}>
      {position ? (
        <DataList
          items={[
            { label: t("latitude"), value: position.latitude.toFixed(6) },
            { label: t("longitude"), value: position.longitude.toFixed(6) },
            {
              label: t("accuracy"),
              value: t("accuracyValue", {
                value: format.number(position.accuracy, { maximumFractionDigits: 1 }),
              }),
            },
            {
              label: t("timestamp"),
              value: format.dateTime(new Date(position.timestamp), { timeStyle: "medium" }),
            },
          ]}
        />
      ) : (
        <p className="rounded-lg border border-dashed border-line px-3 py-6 text-center font-mono text-xs text-muted">
          {t("empty")}
        </p>
      )}

      {support === "unsupported" ? (
        <Notice tone="warn">{t("noticeUnsupported")}</Notice>
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
          {loading ? t("locating") : t("get")}
        </Button>
        {position ? (
          <Button variant="ghost" onClick={() => setPosition(null)}>
            {tCommon("clear")}
          </Button>
        ) : null}
      </div>
    </Card>
  );
};
