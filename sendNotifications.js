import dotenv from "dotenv";
dotenv.config();

import { Expo } from "expo-server-sdk";
import admin from "firebase-admin";
import serviceAccount from "./firebase-service-account.json" assert { type: "json" };

// Inicializar Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("Firebase Admin SDK inicializado:", admin.apps.length > 0);
}

const expo = new Expo();
const firestore = admin.firestore();

/** ============================================
 *   GUARDAR EMERGENCIA EN FIRESTORE
 *  ============================================ */
const saveEmergenciaToFirestore = async (responseString) => {
  try {
    const json = JSON.parse(responseString);

    if (!json.success || !json.data) {
      console.error("El formato de emergencia no es válido.");
      return;
    }

    // Nuevo formato del scraper
    const [fechaHora, direccion, tipo, estado, numeroParte] = json.data;

    // Crear documento
    const timestamp = Date.now();
    await firestore.collection("fire_emergencies").doc(String(timestamp)).set({
      fechaHora,
      direccion,
      tipo,
      estado,
      numeroParte,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Emergencia guardada con ID: ${timestamp}`);
  } catch (err) {
    console.error("Error guardando emergencia:", err.message);
  }
};


/** ============================================
 *      ENVIAR NOTIFICACIONES
 *  ============================================ */
const sendNotifications = async () => {
  try {
    const emergenciaResponse = process.env.SISMO_RESPONSE || '{"success":false}';
    await saveEmergenciaToFirestore(emergenciaResponse);

    const parsed = JSON.parse(emergenciaResponse);

    if (!parsed.success) {
      console.log("No hay emergencia válida para notificar.");
      return;
    }

    const [fechaHora, direccion, tipo, estado] = parsed.data;

    // Obtener los tokens desde Firebase Realtime Database
    const response = await fetch(
      "https://xalereasysos-default-rtdb.firebaseio.com/users.json"
    );
    const data = await response.json();

    if (!data) {
      console.error("No hay usuarios registrados.");
      return;
    }

    const tokens = Object.values(data)
      .map((u) => u.token)
      .filter(Boolean);

    if (tokens.length === 0) {
      console.log("No hay tokens para enviar notificaciones.");
      return;
    }

    const messages = tokens
      .filter((t) => Expo.isExpoPushToken(t))
      .map((token) => ({
        to: token,
        sound: "default",
        title: "🚨 Emergencia Reportada",
        body: `${tipo} en ${direccion}; ${fechaHora}`,
      }));

    // Enviar mensajes en chunks
    const chunks = expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      const receipts = await expo.sendPushNotificationsAsync(chunk);
      console.log("Notificaciones enviadas:", receipts);
    }

  } catch (error) {
    console.error("Error al enviar notificaciones:", error.message);
  }
};

sendNotifications();
