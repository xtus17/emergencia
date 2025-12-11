// scrape.js
/*
const axios = require("axios");
const cheerio = require("cheerio");

const BASE = "https://sgonorte.bomberosperu.gob.pe/24horas/?criterio=";
const CRITERIOS = ["huacho", "vegueta", "huaura"];

async function scrapeOne(criterio) {
  const { data: html } = await axios.get(BASE + criterio, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Accept-Language": "es-ES,es;q=0.9",
    },
  });

  const $ = cheerio.load(html);
  const row = $("table tbody tr").first(); // asumimos que es la más reciente
  const tds = row.find("td");
  if (!tds.length) return null;

  const numeroparte = $(tds[0]).text().trim();
  const fecha = $(tds[1]).text().trim();
  const direccion = $(tds[2]).text().trim();
  const tipo = $(tds[3]).text().trim();
  const compania = $(tds[4]).text().trim();

  return {
    criterio,
    numeroparte,
    fecha,
    direccion,
    tipo,
    compania,
  };
}

// Ajusta esto al formato real, por ejemplo "29/11/2025 21:30"
function parseFecha(fechaStr) {
  // Ejemplo si viene como "DD/MM/YYYY HH:mm"
  // const [fecha, hora] = fechaStr.split(" ");
  // const [d, m, y] = fecha.split("/");
  // return new Date(`${y}-${m}-${d}T${hora}:00`);
  return new Date(fechaStr); // placeholder mientras no confirmes formato
}

function esTipoValido(tipo) {
  const t = tipo.toUpperCase();
  return t.includes("ACCIDENTE VEHICULAR") || t.includes("INCENDIO");
}

async function main() {
  const resultados = (await Promise.all(CRITERIOS.map(scrapeOne))).filter(
    Boolean
  );

  if (!resultados.length) {
    console.log("Sin resultados");
    return;
  }

  // Elegir la más reciente entre las 3
  const masReciente = resultados.reduce((best, cur) => {
    if (!best) return cur;
    const fBest = parseFecha(best.fecha);
    const fCur = parseFecha(cur.fecha);
    return fCur > fBest ? cur : best;
  }, null);

  if (masReciente && esTipoValido(masReciente.tipo)) {
    console.log("Más reciente válida (ACCIDENTE VEHICULAR o INCENDIO):");
    console.log(masReciente);
  } else {
    console.log(
      "La más reciente no es ACCIDENTE VEHICULAR ni INCENDIO. Resultado bruto:"
    );
    console.log(masReciente);
  }
}

main().catch(console.error);
*/

/*
// scrape_puppeteer.js
const puppeteer = require("puppeteer");

const BASE = "https://sgonorte.bomberosperu.gob.pe/24horas/?criterio=";
const CRITERIOS = ["huacho", "vegueta", "huaura"];

async function scrapeOne(criterio) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"
  );

  await page.goto(BASE + criterio, { waitUntil: "networkidle2" });

  const data = await page.evaluate(() => {
    const row = document.querySelector("table tbody tr");
    if (!row) return null;
    const tds = row.querySelectorAll("td");
    if (tds.length === 0) return null;

    return {
      numeroparte: tds[0].innerText.trim(),
      fecha: tds[1].innerText.trim(),
      direccion: tds[2].innerText.trim(),
      tipo: tds[3].innerText.trim(),
      compania: tds[4].innerText.trim(),
    };
  });

  await browser.close();
  return { criterio, ...data };
}

(async () => {
  const res = await Promise.all(CRITERIOS.map(scrapeOne));
  console.log(res);
})();
*/

/*
// scrape_playwright.js
const { chromium } = require("playwright");

const BASE = "https://sgonorte.bomberosperu.gob.pe/24horas/?criterio=";
const CRITERIOS = ["huacho", "vegueta", "huaura"];

async function scrapeOne(criterio) {
  // Crear navegador
  const browser = await chromium.launch({ headless: true });

  // Crear contexto con user-agent
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
  });

  const page = await context.newPage();

  await page.goto(BASE + criterio, {
    waitUntil: "networkidle",
    timeout: 60000,
  });

  // Extraer datos de la tabla
  const data = await page.evaluate(() => {
    const row = document.querySelector("table tbody tr");
    if (!row) return null;

    const tds = row.querySelectorAll("td");
    if (tds.length === 0) return null;

    return {
      numeroparte: tds[0].innerText.trim(),
      fecha: tds[1].innerText.trim(),
      direccion: tds[2].innerText.trim(),
      tipo: tds[3].innerText.trim(),
      compania: tds[4].innerText.trim(),
    };
  });

  await browser.close();

  if (!data) return null;
  return { criterio, ...data };
}

function parseFecha(fechaStr) {
  return new Date(fechaStr);
}

function esTipoValido(tipo) {
  const t = tipo.toUpperCase();
  return t.includes("ACCIDENTE VEHICULAR") || t.includes("INCENDIO");
}

async function main() {
  console.log("Consultando criterios…");

  const resultados = (await Promise.all(CRITERIOS.map(scrapeOne))).filter(
    Boolean
  );

  if (!resultados.length) {
    console.log("⚠️ No se detectaron resultados.");
    return;
  }

  // Elegir el más reciente
  const masReciente = resultados.reduce((best, cur) => {
    if (!best) return cur;
    return parseFecha(cur.fecha) > parseFecha(best.fecha) ? cur : best;
  }, null);

  console.log("\n📌 Resultado más reciente:");
  console.log(masReciente);

  if (masReciente && esTipoValido(masReciente.tipo)) {
    console.log("\n🔥 Evento relevante (ACCIDENTE VEHICULAR / INCENDIO):");
    console.log(masReciente);
  } else {
    console.log("\nℹ️ El evento más reciente NO es de los tipos buscados.");
  }
}

main().catch(console.error);
*/

// scrape_playwright.js
/*
const { chromium } = require("playwright");

const BASE = "https://sgonorte.bomberosperu.gob.pe/24horas/?criterio=";
const CRITERIOS = ["huacho", "vegueta", "huaura"];

async function scrapeOne(criterio) {
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
  });

  const page = await context.newPage();

  await page.goto(BASE + criterio, {
    waitUntil: "networkidle",
    timeout: 60000,
  });

  const data = await page.evaluate(() => {
    const row = document.querySelector("table tbody tr");
    if (!row) return null;

    const tds = row.querySelectorAll("td");
    if (!tds.length) return null;

    return {
      numeroparte: tds[0].innerText.trim(),
      fecha: tds[1].innerText.trim(),
      direccion: tds[2].innerText.trim(),
      tipo: tds[3].innerText.trim(),
      compania: tds[4].innerText.trim(),
    };
  });

  await browser.close();

  if (!data) return null;
  return { criterio, ...data };
}

function esTipoValido(tipo) {
  const t = tipo.toUpperCase();
  return t.includes("ACCIDENTE VEHICULAR") || t.includes("INCENDIO");
}

async function main() {
  console.log("Consultando criterios…");

  const resultados = (await Promise.all(CRITERIOS.map(scrapeOne))).filter(
    Boolean
  );

  if (!resultados.length) {
    console.log("No hay resultados.");
    return;
  }

  // Filtrar solo los relevantes
  const relevantes = resultados.filter((r) => esTipoValido(r.tipo));

  if (!relevantes.length) {
    console.log("No hay eventos relevantes (ACCIDENTE VEHICULAR o INCENDIO).");
    return;
  }

  // Si hay varios, devolver el más reciente
  const masReciente = relevantes.reduce((best, cur) => {
    return new Date(cur.fecha) > new Date(best.fecha) ? cur : best;
  });

  console.log("Evento relevante encontrado:");
  console.log(masReciente);
}

main().catch(console.error);
*/

/*
const { chromium } = require("playwright");

const BASE = "https://sgonorte.bomberosperu.gob.pe/24horas/?criterio=";
const CRITERIOS = ["huacho", "vegueta", "huaura"];

function esTipoValido(tipo) {
  const t = tipo.toUpperCase();
  return t.includes("ACCIDENTE VEHICULAR") || t.includes("INCENDIO");
}

async function scrapear() {
  let browser;
  try {
    browser = await chromium.launch({ headless: false });

    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
      locale: "es-PE",
      viewport: { width: 1280, height: 800 },
    });

    const page = await context.newPage();
    await page.waitForTimeout(2000); // espera 2 segundos

    const resultados = [];

    for (const criterio of CRITERIOS) {
      await page.goto(BASE + criterio, {
        waitUntil: "networkidle",
        timeout: 60000,
      });

      const data = await page.evaluate(() => {
        const row = document.querySelector("table tbody tr");
        if (!row) return null;

        const tds = row.querySelectorAll("td");
        if (!tds.length) return null;

        return {
          numeroparte: tds[0].innerText.trim(),
          fecha: tds[1].innerText.trim(),
          direccion: tds[2].innerText.trim(),
          tipo: tds[3].innerText.trim(),
          compania: tds[4].innerText.trim(),
        };
      });

      if (data && esTipoValido(data.tipo)) {
        resultados.push(data);
      }
    }

    await browser.close();

    if (resultados.length === 0) {
      console.log(JSON.stringify({ success: false, data: [] }, null, 2));
      return;
    }

    // elige la fecha más reciente
    const masReciente = resultados.reduce((best, cur) => {
      return new Date(cur.fecha) > new Date(best.fecha) ? cur : best;
    });

    const arrayFormato = [
      masReciente.fecha,
      masReciente.direccion,
      masReciente.tipo,
      masReciente.compania,
      masReciente.numeroparte,
    ];

    console.log(JSON.stringify({ success: true, data: arrayFormato }, null, 2));
  } catch (error) {
    if (browser) await browser.close();
    console.error({
      success: false,
      data: [],
      message: error.message,
    });
  }
}

scrapear();
*/

import axios from "axios";
import * as cheerio from "cheerio";

const BASE = "https://sgonorte.bomberosperu.gob.pe/24horas/?criterio=";
const CRITERIOS = ["huacho", "vegueta", "huaura","sayan"];

async function scrapeOne(criterio) {
  const { data: html } = await axios.get(BASE + criterio, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Accept-Language": "es-ES,es;q=0.9",
    },
  });

  const $ = cheerio.load(html);
  const row = $("table tbody tr").first();
  const tds = row.find("td");
  if (!tds.length) return null;

  return {
    criterio,
    numeroparte: $(tds[0]).text().trim(),
    fecha: $(tds[1]).text().trim(),
    direccion: $(tds[2]).text().trim(),
    tipo: $(tds[3]).text().trim(),
    compania: $(tds[4]).text().trim(),
  };
}

function parseFecha(f) {
  return new Date(f);
}

export default async function handler(req, res) {
  try {
    const resultados = (await Promise.all(CRITERIOS.map(scrapeOne))).filter(
      Boolean
    );

    if (!resultados.length) {
      return res.status(200).json({ success: true, data: null });
    }

    const masReciente = resultados.reduce((best, cur) => {
      if (!best) return cur;
      return parseFecha(cur.fecha) > parseFecha(best.fecha) ? cur : best;
    }, null);

    return res.status(200).json({
      success: true,
      data: masReciente
        ? [
            masReciente.fecha,
            masReciente.direccion,
            masReciente.tipo,
            masReciente.compania,
            masReciente.numeroparte,
          ]
        : null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
