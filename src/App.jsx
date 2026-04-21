import { useMemo, useState } from "react";
import PulseMap from "./components/PulseMap";
import {
  AVAILABLE_COUNTRIES,
  COUNTRY_BRIEFINGS,
  TOPICS,
} from "./lib/newsData";

const INITIAL_COUNTRY = "Mexico";
const INITIAL_TOPIC = TOPICS[0].id;

function getTodayLabel() {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
  }).format(new Date());
}

function getCountryLabel(country) {
  return COUNTRY_BRIEFINGS[country]?.displayName || country;
}

function SourceLink({ item }) {
  return (
    <a href={item.url} target="_blank" rel="noreferrer" className="source-link">
      Abrir fuente
    </a>
  );
}

function EmptyCountry({ country }) {
  return (
    <section className="empty-country">
      <span className="title-kicker">Sin cobertura</span>
      <h3>{country}</h3>
      <p>
        Este país queda en gris porque no le cargué noticias para la entrega.
        Usa los países resaltados para consultar los temas completos.
      </p>
    </section>
  );
}

function TopicCard({ item, active, onSelect }) {
  return (
    <button
      type="button"
      className={`topic-card ${active ? "topic-card-active" : ""}`}
      onClick={onSelect}
    >
      <span>{item.group}</span>
      <strong>{item.label}</strong>
      <small>{item.source}</small>
    </button>
  );
}

function FeaturedStory({ story, country }) {
  return (
    <article
      className="featured-story"
      key={`${country}-${story.id}`}
    >
      <div className="story-topline">
        <span>{story.group}</span>
        <span>{story.date}</span>
      </div>
      <h3>{story.label}</h3>
      <h4>{story.title}</h4>
      <p>{story.summary}</p>
      <div className="classroom-note">
        <span>Nota para clase</span>
        <p>{story.classroomNote}</p>
      </div>
      <div className="story-footer">
        <span>{story.source}</span>
        <SourceLink item={story} />
      </div>
    </article>
  );
}

export default function App() {
  const [selectedCountry, setSelectedCountry] = useState(INITIAL_COUNTRY);
  const [selectedTopicId, setSelectedTopicId] = useState(INITIAL_TOPIC);

  const briefing = COUNTRY_BRIEFINGS[selectedCountry];
  const topicOptions = briefing?.topics || TOPICS;
  const selectedStory = useMemo(() => {
    if (!briefing) {
      return null;
    }

    return (
      briefing.topics.find((topic) => topic.id === selectedTopicId) ||
      briefing.topics[0]
    );
  }, [briefing, selectedTopicId]);

  const countryLabel = getCountryLabel(selectedCountry);

  return (
    <div className="app-shell">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />
      <div className="ambient ambient-c" />

      <main className="map-page">
        <section className="map-stage panel section-enter">
          <div className="stage-copy">
            <div className="title-block">
              <span className="title-kicker">Edición global</span>
              <h1>Periódico de Finanzas Internacionales</h1>
            </div>

            <div className="stage-meta">
              <div className="meta-card">
                <span>País activo</span>
                <strong>{countryLabel}</strong>
              </div>
              <div className="meta-card">
                <span>Actualizado</span>
                <strong>{getTodayLabel()}</strong>
              </div>
            </div>
          </div>

          <div className="map-shell">
            <PulseMap
              selectedCountry={selectedCountry}
              onCountrySelect={(country) => {
                setSelectedCountry(country);
                setSelectedTopicId(INITIAL_TOPIC);
              }}
              availableCountries={AVAILABLE_COUNTRIES}
            />
          </div>
        </section>

        <section className="news-panel panel section-enter section-enter-delay">
          <div className="news-panel-top">
            <div className="news-panel-title">
              <span className="title-kicker">Noticias por tema</span>
              <h2>{countryLabel}</h2>
            </div>

            <div className="selectors">
              <label>
                País
                <select
                  value={selectedCountry}
                  onChange={(event) => {
                    setSelectedCountry(event.target.value);
                    setSelectedTopicId(INITIAL_TOPIC);
                  }}
                >
                  {AVAILABLE_COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {getCountryLabel(country)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Tema
                <select
                  value={selectedStory?.id || INITIAL_TOPIC}
                  onChange={(event) => setSelectedTopicId(event.target.value)}
                  disabled={!briefing}
                >
                  {topicOptions.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {!briefing ? (
            <EmptyCountry country={selectedCountry} />
          ) : (
            <div className="briefing-layout">
              <aside className="topic-rail" aria-label="Temas disponibles">
                {briefing.topics.map((topic) => (
                  <TopicCard
                    key={topic.id}
                    item={topic}
                    active={topic.id === selectedStory.id}
                    onSelect={() => setSelectedTopicId(topic.id)}
                  />
                ))}
              </aside>

              <div className="story-stack">
                <FeaturedStory story={selectedStory} country={selectedCountry} />

                <section className="source-board">
                  <div>
                    <span className="title-kicker">Fuentes usadas</span>
                    <h3>Base reciente de {countryLabel}</h3>
                  </div>
                  <div className="source-grid">
                    {Object.values(briefing.sources).map((source) => (
                      <a
                        className="source-tile"
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        key={`${source.source}-${source.headline}`}
                      >
                        <span>{source.date}</span>
                        <strong>{source.source}</strong>
                        <p>{source.headline}</p>
                      </a>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
