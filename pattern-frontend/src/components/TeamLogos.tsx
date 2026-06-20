/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";

interface TeamLogoProps {
  id: string;
  size?: number;
  className?: string;
}

// Ultra high-definition official Wikimedia vector SVG URLs
const wikiLogos: Record<string, string> = {
  mancity: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
  manchestercity: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
  
  arsenal: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
  
  liverpool: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
  
  chelsea: "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",
  
  wolves: "https://upload.wikimedia.org/wikipedia/en/f/fc/Wolverhampton_Wanderers_FC_crest.svg",
  wolverhamptonwanderers: "https://upload.wikimedia.org/wikipedia/en/f/fc/Wolverhampton_Wanderers_FC_crest.svg",
  
  intermilan: "https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Inter_Milano_2021_Logo.svg",
  inter: "https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Inter_Milano_2021_Logo.svg",
  
  manunited: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
  manchesterunited: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
  
  tottenham: "https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg",
  tottenhamhotspur: "https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg",
  
  realmadrid: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
  
  barcelona: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
  fcbarcelona: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg"
};

const fotmobIds: Record<string, string> = {
  mancity: "8457",
  manc: "8457",
  manchestercity: "8457",
  
  arsenal: "9825",
  ars: "9825",
  
  liverpool: "8650",
  liv: "8650",
  
  chelsea: "8455",
  che: "8455",
  
  wolves: "8602",
  wol: "8602",
  
  intermilan: "8636",
  inter: "8636",
  
  manunited: "10260",
  mun: "10260",
  utd: "10260",
  
  tottenham: "8586",
  tot: "8586",
  
  realmadrid: "8633",
  rmd: "8633",
  
  barcelona: "8634",
  bar: "8634",
  fcb: "8634"
};

export const TeamLogo: React.FC<TeamLogoProps> = ({ id, size = 48, className = "" }) => {
  const normId = id.toLowerCase().replace(/[\s_.-]/g, "");
  
  const wikiUrl = wikiLogos[normId];
  const fotmobId = fotmobIds[normId];
  const fotmobUrl = fotmobId ? `https://images.fotmob.com/image_resources/logo/teamlogo/${fotmobId}.png` : null;

  // Track loading stages: 0 = primary wiki SVG, 1 = backup fotmob, 2 = elegant visual vector shield
  const [sourceState, setSourceState] = useState<0 | 1 | 2>(wikiUrl ? 0 : fotmobUrl ? 1 : 2);

  const handleError = () => {
    if (sourceState === 0) {
      setSourceState(fotmobUrl ? 1 : 2);
    } else if (sourceState === 1) {
      setSourceState(2);
    }
  };

  const currentUrl = sourceState === 0 ? wikiUrl : sourceState === 1 ? fotmobUrl : null;

  if (currentUrl) {
    return (
      <img
        src={currentUrl}
        alt={`${id} Logo`}
        onError={handleError}
        referrerPolicy="no-referrer"
        className={`object-contain select-none transition-transform duration-300 hover:scale-110 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // Elegant fallback shield
  const init1 = id.substring(0, 1).toUpperCase();
  const init2 = id.length > 1 ? id.substring(1, 2).toUpperCase() : "";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`${className} transition-transform duration-300 hover:scale-110`}
      style={{ overflow: "visible" }}
    >
      <path
        d="M 15,15 C 35,10 50,4 50,4 C 50,4 65,10 85,15 C 85,15 90,60 50,94 C 10,60 15,15 15,15 Z"
        fill="#1E293B"
        stroke="#3b82f6"
        strokeWidth="3.5"
      />
      <circle cx="50" cy="50" r="16" fill="#27272a" stroke="#3b82f6" strokeWidth="1" />
      <text
        x="50"
        y="56"
        fontFamily="Inter, sans-serif"
        fontSize="16"
        fontWeight="bold"
        fill="#FFFFFF"
        textAnchor="middle"
      >
        {init1}
        {init2}
      </text>
    </svg>
  );
};
