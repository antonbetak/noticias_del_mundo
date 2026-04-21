import { useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import worldGeo from "world-atlas/countries-110m.json";

const COUNTRY_FOCUS = {
  Africa: { coordinates: [20, 2], zoom: 1.75 },
  Mexico: { coordinates: [-102, 23], zoom: 2.5 },
  "United States of America": { coordinates: [-98, 39], zoom: 1.9 },
  Canada: { coordinates: [-95, 60], zoom: 1.7 },
  Brazil: { coordinates: [-52, -14], zoom: 2.1 },
  Argentina: { coordinates: [-64, -36], zoom: 2.2 },
  Spain: { coordinates: [-3.7, 40.2], zoom: 3.1 },
  France: { coordinates: [2.4, 46.3], zoom: 3.1 },
  Germany: { coordinates: [10.4, 51.1], zoom: 3.2 },
  "United Kingdom": { coordinates: [-2.8, 54.5], zoom: 3.2 },
  Italy: { coordinates: [12.5, 42.8], zoom: 3.1 },
  Russia: { coordinates: [105, 61], zoom: 1.6 },
  China: { coordinates: [104, 35], zoom: 2.1 },
  "South Korea": { coordinates: [127.8, 36.3], zoom: 4.3 },
  "North Korea": { coordinates: [127.2, 40.1], zoom: 4.2 },
  India: { coordinates: [78.9, 22.8], zoom: 2.6 },
  Japan: { coordinates: [138, 37], zoom: 3.1 },
  Australia: { coordinates: [134, -25], zoom: 1.8 },
  "South Africa": { coordinates: [24, -29], zoom: 2.5 },
};

const AFRICA_COUNTRIES = new Set([
  "Algeria",
  "Angola",
  "Benin",
  "Botswana",
  "Burkina Faso",
  "Burundi",
  "Cameroon",
  "Central African Republic",
  "Central African Rep.",
  "Chad",
  "Congo",
  "Côte d'Ivoire",
  "Democratic Republic of the Congo",
  "Dem. Rep. Congo",
  "Djibouti",
  "Egypt",
  "Equatorial Guinea",
  "Eq. Guinea",
  "Eritrea",
  "Ethiopia",
  "Gabon",
  "Gambia",
  "Ghana",
  "Guinea",
  "Guinea-Bissau",
  "Ivory Coast",
  "Kenya",
  "Lesotho",
  "Liberia",
  "Libya",
  "Madagascar",
  "Malawi",
  "Mali",
  "Mauritania",
  "Morocco",
  "Mozambique",
  "Namibia",
  "Niger",
  "Nigeria",
  "Rwanda",
  "Senegal",
  "Sierra Leone",
  "Somalia",
  "Somaliland",
  "South Africa",
  "South Sudan",
  "S. Sudan",
  "Sudan",
  "Tanzania",
  "Togo",
  "Tunisia",
  "Uganda",
  "Western Sahara",
  "W. Sahara",
  "Zambia",
  "Zimbabwe",
  "eSwatini",
]);

function getCountryFocus(name) {
  return COUNTRY_FOCUS[name] || { coordinates: [0, 12], zoom: 2.2 };
}

function getSelectionName(name) {
  return AFRICA_COUNTRIES.has(name) ? "Africa" : name;
}

export default function PulseMap({
  selectedCountry,
  onCountrySelect,
  availableCountries = [],
}) {
  const [position, setPosition] = useState({
    coordinates: [0, 12],
    zoom: 1,
  });

  const zoomIn = () => {
    setPosition((current) => ({
      ...current,
      zoom: Math.min(current.zoom * 1.35, 6),
    }));
  };

  const zoomOut = () => {
    setPosition((current) => ({
      ...current,
      zoom: Math.max(current.zoom / 1.35, 1),
    }));
  };

  const resetMap = () => {
    setPosition({
      coordinates: [0, 12],
      zoom: 1,
    });
  };

  const mapControlsLabel = useMemo(
    () =>
      position.zoom > 1
        ? `Zoom ${position.zoom.toFixed(1)}x`
        : "Vista global",
    [position.zoom],
  );
  const availableCountrySet = useMemo(
    () => new Set(availableCountries),
    [availableCountries],
  );

  return (
    <div className="world-map-wrap">
      <ComposableMap projection="geoEqualEarth" className="world-map">
        <ZoomableGroup
          center={position.coordinates}
          zoom={position.zoom}
          onMoveEnd={setPosition}
          translateExtent={[
            [-220, -120],
            [1020, 620],
          ]}
        >
          <Geographies geography={worldGeo}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryName = geo.properties.name;
                const selectionName = getSelectionName(countryName);
                const isSelected =
                  countryName === selectedCountry || selectionName === selectedCountry;
                const hasCoverage =
                  availableCountrySet.has(countryName) ||
                  availableCountrySet.has(selectionName);

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => {
                      onCountrySelect(selectionName);
                      setPosition(getCountryFocus(selectionName));
                    }}
                    style={{
                      default: {
                        fill: isSelected
                          ? "#7ef2ff"
                          : hasCoverage
                            ? "#17486a"
                            : "#283241",
                        outline: "none",
                        stroke: isSelected
                          ? "rgba(255,255,255,0.42)"
                          : hasCoverage
                            ? "rgba(148, 204, 255, 0.16)"
                            : "rgba(255, 255, 255, 0.08)",
                        strokeWidth: isSelected ? 0.9 : 0.45,
                        opacity: hasCoverage || isSelected ? 1 : 0.46,
                        filter: isSelected
                          ? "drop-shadow(0 0 10px rgba(126, 242, 255, 0.35))"
                          : "none",
                      },
                      hover: {
                        fill: hasCoverage ? "#25d8ff" : "#3b4655",
                        outline: "none",
                        stroke: "rgba(255,255,255,0.34)",
                        strokeWidth: 0.7,
                        cursor: "pointer",
                      },
                      pressed: {
                        fill: "#c6fbff",
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      <div className="map-controls">
        <div className="map-controls-group">
          <button
            type="button"
            className="map-control-button"
            onClick={zoomIn}
            aria-label="Acercar mapa"
          >
            +
          </button>
          <button
            type="button"
            className="map-control-button"
            onClick={zoomOut}
            aria-label="Alejar mapa"
          >
            -
          </button>
          <button
            type="button"
            className="map-control-button map-control-button-wide"
            onClick={resetMap}
          >
            Reset
          </button>
        </div>
        <div className="map-controls-readout">
          <span>{mapControlsLabel}</span>
          <strong>Arrastra, toca y explora</strong>
        </div>
      </div>

      <div
        className="map-selection-chip"
        key={selectedCountry}
      >
        <span>Selección activa</span>
        <strong>{selectedCountry === "Africa" ? "África" : selectedCountry}</strong>
        {!availableCountrySet.has(selectedCountry) ? (
          <small>Sin noticias cargadas</small>
        ) : null}
      </div>
    </div>
  );
}
