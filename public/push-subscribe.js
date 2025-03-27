async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      return registration;
    } catch (error) {
      console.error("Error al registrar el service worker:", error);
      throw error;
    }
  }
  throw new Error("Service Worker no es compatible con este navegador");
}

async function subscribeToPushNotifications(publicVapidKey) {
  try {
    const registration = await registerServiceWorker();

    // Comprobar si ya hay una suscripción activa
    let subscription = await registration.pushManager.getSubscription();

    // Si existe, devolver la suscripción actual
    if (subscription) {
      return subscription;
    }

    // Convertir la clave pública a Uint8Array
    const vapidPublicKey = urlBase64ToUint8Array(publicVapidKey);

    // Crear nueva suscripción
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey,
    });

    return subscription;
  } catch (error) {
    console.error("Error al suscribirse a notificaciones push:", error);
    throw error;
  }
}

async function unsubscribeFromPushNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error al cancelar la suscripción:", error);
    throw error;
  }
}

// Función auxiliar para convertir el formato base64 URL seguro a Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

window.pushNotifications = {
  subscribe: subscribeToPushNotifications,
  unsubscribe: unsubscribeFromPushNotifications,
};
