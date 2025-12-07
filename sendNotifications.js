import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import { Expo } from "expo-server-sdk";
import admin from "firebase-admin";

// Cargar credenciales Firebase SIN assert
const serviceAccount = JSON.parse(
  fs.readFileSync("./firebase-service-account.json", "utsf8")
);

// Inicializar Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("Firebase inicializado");
}

const expo = new Expo();
const firestore = admin.firestore();

const saveEmergenciaToFirestore = async (responseString) => {
  try {
    const json = JSON.parse(responseString);

    if (!json.success || !json.data) {
      console.error("Formato inválido.");
      return;
    }

    const [fechaHora, direccion, tipo, estado, numeroParte] = json.data;
    const timestamp = Date.now();

    await firestore.collection("fire_emergencies").doc(String(timestamp)).set({
      fechaHora,
      direccion,
      tipo,
      estado,
      numeroParte,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Guardado en Firestore ID: ${timestamp}`);
  } catch (err) {
    console.error("Error guardando:", err.message);
  }
};

const sendNotifications = async () => {
  try {
    const emergenciaResponse =
      process.env.EMERGENCIA_RESPONSE || '{"success":false}';

    await saveEmergenciaToFirestore(emergenciaResponse);

    const parsed = JSON.parse(emergenciaResponse);

    if (!parsed.success) {
      console.log("No hay emergencia válida.");
      return;
    }

    const [fechaHora, direccion, tipo, estado] = parsed.data;

    const response = await fetch(
      "https://xalereasysos-default-rtdb.firebaseio.com/users.json"
    );

    const data = await response.json();
    if (!data) return;

    const tokens = Object.values(data)
      .map((u) => u.token)
      .filter(Boolean)
      .filter((t) => Expo.isExpoPushToken(t));

    if (tokens.length === 0) {
      console.log("No hay tokens.");
      return;
    }

    const messages = tokens.map((token) => ({
      to: token,
      sound: "default",
      title: "🚨 Emergencia Reportada",
      body: `${tipo} en ${direccion}; ${fechaHora}`,
    }));

    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      const receipts = await expo.sendPushNotificationsAsync(chunk);
      console.log("Notificaciones enviadas:", receipts);
    }
  } catch (error) {
    console.error("Error enviando:", error.message);
  }
};

sendNotifications();
