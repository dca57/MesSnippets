import React, { useState } from "react";
import { Icons } from "@/core/helpers/icons";

export const Favicon = ({
  url,
  className,
}: {
  url: string;
  className?: string;
}) => {
  const [source, setSource] = useState<"google" | "ddg" | "error">("google");

  if (!url)
    return <Icons.Globe size={16} className={`text-slate-400 ${className}`} />;

  let domain = "";
  try {
    domain = new URL(url).hostname;
  } catch (e) {
    return <Icons.Globe size={16} className={`text-slate-400 ${className}`} />;
  }

  const handleError = () => {
    if (source === "google") setSource("ddg");
    else if (source === "ddg") setSource("error");
  };

  if (source === "error") {
    return <Icons.Globe size={16} className={`text-slate-400 ${className}`} />;
  }

  const src =
    source === "google"
      ? `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=128`
      : `https://icons.duckduckgo.com/ip2/${domain}.ico`;

  return (
    <img
      src={src}
      alt="icon"
      className={`${className} object-contain`}
      onError={handleError}
    />
  );
};
