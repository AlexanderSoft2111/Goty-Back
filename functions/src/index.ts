import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";


// Extrayendo las credenciales de firebase
const serviceAccount = ("src/serviceAccountKey.json");

// Inicializando la app de firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Referencia a la base de datos de fireStore
const db = admin.firestore();

// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.json("Hola mundo");
});

export const getGoty = functions.https.onRequest( async (request, response) => {
  // Obtener los parametros que se envian
  // const nombre = request.query.nombre || "Sin nombre";

  // Referencia a la coleccion goty de la BD
  const gotyRef = db.collection("Goty");

  // Referencia a la fotografía de la BD en ese momento y regresa una promesa
  const docsSnap = await gotyRef.get();

  // Coleccion de la fotografía para obtener los documentos
  // con el metodo data de cada uno
  const juegos = docsSnap.docs.map( (juego) => juego.data() );

  response.json( juegos );
});


// Express configuración
const app = express();
app.use( cors({origin: true}) );

// Definimos la ruta que queremos crear y le definimos el tipo de consulta
app.get("/goty", async (req, res) => {
  // Referencia a la coleccion goty de la BD
  const gotyRef = db.collection("Goty");

  // Referencia a la fotografía de la BD en ese momento y regresa una promesa
  const docsSnap = await gotyRef.get();

  // Coleccion de la fotografía para obtener los documentos
  // con el metodo data de cada uno
  const juegos = docsSnap.docs.map( (juego) => juego.data() );

  res.json( juegos );
});

app.post("/goty/:id", async (req, res) => {
  // Obtenemos el id que enviamos en la url
  const id = req.params.id;

  // Hacemos referencia al documento de la colección
  const gameRef = db.collection("Goty").doc(id);

  // Capturamos la información de ese momento
  const gameSnap = await gameRef.get();

  // Consultamos si existe la información
  if (!gameSnap.exists) {
    // Enviamos un mensaje en objeto json
    res.status(404).json({
      ok: false,
      msg: "No existe un juego con es ID: " + id,
    });
  } else {
    // Obtenemos el documento de la colección y en caso de que no
    // hay información enviamos un objetos con la propiedad votos en cero
    const docAntes = gameSnap.data() || {votos: 0};

    // Actualizamos la información
    await gameRef.update({
      votos: docAntes.votos + 1,
    });

    res.status(200).json({
      ok: true,
      msg: `Gracias por tu voto a ${docAntes.name}`,
    });
  }
});

// Le indicamos a firebase el servido de express
// y construimos la ruta de api/ y la exportamos
export const api = functions.https.onRequest( app );

