import { writeFile } from "node:fs/promises";
import { TOPICS } from "../src/lib/newsData.js";

const OUTPUT_PATH = new URL("../src/lib/autoNewsData.js", import.meta.url);
const UPDATE_EVERY_DAYS = 15;
const COUNTRY_KEY = "Mexico";
const MAX_ARTICLE_AGE_DAYS = 120;

const ALLOWED_SOURCE_TERMS = [
  "Yahoo Finanzas",
  "Expansión",
  "El Economista",
  "Banco de México",
  "Banxico",
  "Investing.com",
  "Reuters",
  "Euronews",
];

const BLOCKED_TERMS = [
  "futbol",
  "fútbol",
  "liga mx",
  "champions",
  "eurocopa",
  "uefa",
  "real madrid",
  "barcelona",
  "america",
  "américa",
  "chivas",
  "cruz azul",
  "pumas",
  "monterrey",
  "tigres",
  "partido",
  "gol",
  "tenis",
  "beisbol",
  "béisbol",
  "nba",
  "nfl",
];
const GENERIC_TITLE_TERMS = [
  "datos de méxico",
  "minuta número",
  "informes anuales",
  "documento completo",
  "comunicado de prensa",
];

const TOPIC_RULES = {
  "global-finance": {
    query: "México finanzas internacionales globalización economía inversión comercio tasas",
    required: ["méxico", "economía", "finanzas", "inversión", "comercio", "banxico"],
  },
  origins: {
    query: "México comercio inversión pagos internacionales finanzas internacionales",
    required: ["comercio", "inversión", "pagos", "finanzas", "méxico"],
  },
  interdependence: {
    query: "México interdependencia economía Estados Unidos T-MEC comercio inversión",
    required: ["méxico", "estados unidos", "t-mec", "comercio", "inversión"],
  },
  "globalization-concept": {
    query: "México globalización nearshoring inversión extranjera comercio cadenas suministro",
    required: ["globalización", "nearshoring", "inversión", "comercio", "cadenas"],
  },
  "globalization-risks": {
    query: "México riesgos globalización inflación crecimiento comercio T-MEC Banxico",
    required: ["riesgo", "inflación", "crecimiento", "t-mec", "banxico"],
  },
  ims: {
    query: "México sistema monetario internacional peso dólar Banxico tasas",
    required: ["peso", "dólar", "banxico", "tasas", "monetario"],
  },
  "monetary-systems": {
    query: "México política monetaria Banxico peso dólar tasas inflación",
    required: ["banxico", "peso", "dólar", "tasas", "inflación"],
  },
  "ims-history": {
    query: "México tipo de cambio peso dólar historia sistema monetario tasas Banxico",
    required: ["tipo de cambio", "peso", "dólar", "banxico", "monetario"],
  },
  "bop-crisis": {
    query: "México balanza de pagos déficit cuenta corriente reservas crisis externa",
    required: ["balanza de pagos", "cuenta corriente", "déficit", "reservas", "externa"],
  },
  bop: {
    query: "México balanza de pagos cuenta corriente Banxico exportaciones importaciones",
    required: ["balanza de pagos", "cuenta corriente", "exportaciones", "importaciones", "banxico"],
  },
  "bop-components": {
    query: "México cuenta corriente inversión extranjera balanza de pagos componentes",
    required: ["cuenta corriente", "inversión extranjera", "balanza", "exportaciones"],
  },
  transactions: {
    query: "México transacciones balanza de pagos exportaciones importaciones inversión extranjera",
    required: ["transacciones", "exportaciones", "importaciones", "inversión", "balanza"],
  },
  "bop-interpretation": {
    query: "México interpretar cuenta corriente déficit superávit balanza de pagos",
    required: ["cuenta corriente", "déficit", "superávit", "balanza"],
  },
  "double-entry": {
    query: "México balanza de pagos cuenta corriente cuenta financiera inversión extranjera",
    required: ["balanza de pagos", "cuenta corriente", "cuenta financiera", "inversión"],
  },
  "mexico-current-account": {
    query: "México cuenta corriente déficit superávit Banxico 2026",
    required: ["méxico", "cuenta corriente", "déficit", "superávit", "banxico"],
  },
  "fx-theory": {
    query: "México tipo de cambio peso dólar Banxico inflación tasas",
    required: ["tipo de cambio", "peso", "dólar", "banxico", "tasas"],
  },
  "fx-market": {
    query: "México mercado de divisas peso dólar Banxico volatilidad",
    required: ["mercado", "divisas", "peso", "dólar", "volatilidad"],
  },
  "cross-rate": {
    query: "peso mexicano dólar euro tipo de cambio cruzado divisas",
    required: ["peso", "dólar", "euro", "tipo de cambio", "divisas"],
  },
  "effective-rate": {
    query: "México tipo de cambio efectivo peso socios comerciales dólar",
    required: ["tipo de cambio", "peso", "comercio", "socios", "dólar"],
  },
  ppp: {
    query: "México paridad poder adquisitivo inflación tipo de cambio peso",
    required: ["inflación", "poder adquisitivo", "tipo de cambio", "peso"],
  },
  fisher: {
    query: "México efecto Fisher tasas inflación Banxico peso dólar",
    required: ["tasas", "inflación", "banxico", "peso", "dólar"],
  },
  "real-rate": {
    query: "México tipo de cambio real inflación competitividad peso",
    required: ["tipo de cambio real", "inflación", "competitividad", "peso"],
  },
  "derivatives-market": {
    query: "México mercado de derivados MexDer futuros opciones swaps",
    required: ["derivados", "mexder", "futuros", "opciones", "swaps"],
  },
  "derivative-instrument": {
    query: "México instrumento derivado MexDer futuros opciones cobertura",
    required: ["derivado", "mexder", "futuros", "opciones", "cobertura"],
  },
  "forward-contracts": {
    query: "México contratos a plazo forward cobertura dólar peso derivados",
    required: ["contratos", "plazo", "forward", "cobertura", "dólar"],
  },
  forward: {
    query: "México forward dólar peso cobertura cambiaria derivados",
    required: ["forward", "dólar", "peso", "cobertura", "derivados"],
  },
  futures: {
    query: "México futuros MexDer dólar acciones tasas derivados",
    required: ["futuros", "mexder", "dólar", "acciones", "tasas"],
  },
  options: {
    query: "México opciones MexDer derivados dólar acciones cobertura",
    required: ["opciones", "mexder", "derivados", "cobertura"],
  },
  "closing-forward": {
    query: "México cierre posiciones derivados futuros opciones cobertura",
    required: ["cierre", "posiciones", "derivados", "futuros", "cobertura"],
  },
  "forward-futures-diff": {
    query: "México diferencias forwards futuros derivados cobertura MexDer",
    required: ["forwards", "futuros", "derivados", "mexder", "cobertura"],
  },
  "fx-swaps": {
    query: "México swaps divisas tasas TIIE derivados cobertura",
    required: ["swaps", "divisas", "tiie", "derivados", "cobertura"],
  },
  "currency-financial-crises": {
    query: "México crisis cambiaria financiera peso dólar inflación tasas",
    required: ["crisis", "cambiaria", "financiera", "peso", "dólar"],
  },
  "contemporary-currency-crises": {
    query: "México crisis cambiaria contemporánea peso Banxico volatilidad",
    required: ["crisis", "cambiaria", "peso", "banxico", "volatilidad"],
  },
  "contemporary-bop-crises": {
    query: "México crisis balanza de pagos contemporánea cuenta corriente déficit",
    required: ["crisis", "balanza de pagos", "cuenta corriente", "déficit"],
  },
  "international-cases": {
    query: "México casos internacionales economía global inversión comercio T-MEC",
    required: ["méxico", "internacional", "inversión", "comercio", "t-mec"],
  },
  "china-rise": {
    query: "China crecimiento económico exportaciones superávit inversión 2026",
    required: ["china", "crecimiento", "exportaciones", "superávit", "inversión"],
  },
  "power-shift": {
    query: "cambio poder económico mundial China Estados Unidos México nearshoring",
    required: ["china", "estados unidos", "méxico", "nearshoring", "económico"],
  },
  "crisis-2008": {
    query: "crisis financiera 2008 bancos crédito deuda México",
    required: ["crisis financiera", "2008", "bancos", "crédito", "deuda"],
  },
  "sovereign-debt-2010": {
    query: "crisis deuda soberana 2010 eurozona rescate FMI bancos",
    required: ["deuda soberana", "2010", "eurozona", "rescate", "fmi"],
  },
  "euro-problems": {
    query: "problemas del euro eurozona BCE inflación deuda tasas",
    required: ["euro", "eurozona", "bce", "inflación", "deuda", "tasas"],
  },
};

const FALLBACK_TERMS = ["economía", "finanzas", "mercados", "banxico", "inversión"];

function decodeXml(value = "") {
  return value
    .replaceAll("<![CDATA[", "")
    .replaceAll("]]>", "")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", "\"")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .trim();
}

function stripTags(value = "") {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function normalize(value = "") {
  return value
    .toLocaleLowerCase("es-MX")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function hasAny(text, terms) {
  const normalized = normalize(text);
  return terms.some((term) => normalized.includes(normalize(term)));
}

function scoreItem(item, topic, rules) {
  const haystack = `${item.title} ${item.source} ${item.summary}`;
  const title = item.title || "";

  if (hasAny(haystack, BLOCKED_TERMS)) {
    return -100;
  }

  if (hasAny(title, GENERIC_TITLE_TERMS)) {
    return -100;
  }

  let score = 0;
  const required = rules.required?.length ? rules.required : FALLBACK_TERMS;
  const titleMatchesRequired = required.some((term) => hasAny(title, [term]));

  for (const term of required) {
    if (hasAny(haystack, [term])) {
      score += 4;
    }
  }

  if (hasAny(haystack, [topic.label])) {
    score += 6;
  }

  if (titleMatchesRequired) {
    score += 6;
  } else {
    score -= 8;
  }

  if (hasAny(haystack, ALLOWED_SOURCE_TERMS)) {
    score += 4;
  }

  if (hasAny(haystack, ["méxico", "banxico", "peso", "dólar", "euro", "china", "bce", "fmi"])) {
    score += 2;
  }

  return score;
}

function parseRssItems(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => {
    const itemXml = match[1];
    const rawTitle = decodeXml(itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1]);
    const source = decodeXml(itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1]);
    const title = rawTitle.replace(/\s+-\s+[^-]+$/, "").trim();
    const url = decodeXml(itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1]);
    const published = decodeXml(itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]);
    const description = stripTags(decodeXml(itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1]));

    return {
      title,
      source: source || rawTitle.split(" - ").at(-1) || "Google News",
      url,
      published,
      summary: description,
    };
  });
}

async function fetchCandidates(topic) {
  const rules = TOPIC_RULES[topic.id] || {
    query: `${topic.label} México finanzas economía`,
    required: FALLBACK_TERMS,
  };
  const sourceQuery = "(site:es-us.finanzas.yahoo.com OR site:expansion.mx OR site:eleconomista.com.mx OR site:banxico.org.mx)";
  const query = `${rules.query} ${sourceQuery}`;
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=es-419&gl=MX&ceid=MX:es-419`;
  const response = await fetch(url, {
    headers: {
      "user-agent": "soto-global-briefing-news-updater/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Google News RSS failed for ${topic.id}: ${response.status}`);
  }

  const xml = await response.text();
  const seen = new Set();

  return parseRssItems(xml)
    .map((item) => ({
      ...item,
      score: scoreItem(item, topic, rules),
    }))
    .filter((item) => {
      const publishedAt = new Date(item.published).getTime();

      if (!Number.isFinite(publishedAt)) {
        return false;
      }

      const maxAgeMs = MAX_ARTICLE_AGE_DAYS * 24 * 60 * 60 * 1000;
      return Date.now() - publishedAt <= maxAgeMs;
    })
    .filter((item) => item.score >= 8)
    .filter((item) => {
      const key = normalize(`${item.title} ${item.source}`);

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date());
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function buildStory(candidate, topic, index) {
  const labels = ["Dato clave", "Contexto reciente", "Lectura financiera"];

  return {
    headline: `${labels[index]} para ${topic.label}: ${candidate.title}`,
    source: candidate.source,
    date: formatDate(candidate.published),
    url: candidate.url,
    summary: `Actualización automática filtrada para ${topic.label.toLowerCase()}. ${candidate.summary || candidate.title}`,
  };
}

async function main() {
  const countries = {
    [COUNTRY_KEY]: {
      topics: {},
    },
  };
  let updatedTopics = 0;

  for (const topic of TOPICS) {
    try {
      const candidates = await fetchCandidates(topic);

      if (candidates.length === 3) {
        countries[COUNTRY_KEY].topics[topic.id] = candidates.map((candidate, index) =>
          buildStory(candidate, topic, index),
        );
        updatedTopics += 1;
      } else {
        console.log(`Keeping fallback for ${topic.label}: only ${candidates.length} strong candidates`);
      }
    } catch (error) {
      console.log(`Keeping fallback for ${topic.label}: ${error.message}`);
    }
  }

  const autoNews = {
    metadata: {
      generatedAt: new Date().toISOString(),
      updateEveryDays: UPDATE_EVERY_DAYS,
      source: "google-news-rss-filtered",
      updatedTopics,
      note: "Auto-generated. Topics without 3 strong candidates use curated fallback newsData.js.",
    },
    countries,
  };
  const content = `export const AUTO_NEWS = ${JSON.stringify(autoNews, null, 2)};\n`;

  await writeFile(OUTPUT_PATH, content, "utf8");
  console.log(`Wrote ${OUTPUT_PATH.pathname}`);
  console.log(`Updated ${updatedTopics}/${TOPICS.length} topics for ${COUNTRY_KEY}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
