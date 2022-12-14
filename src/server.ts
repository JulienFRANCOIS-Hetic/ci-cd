import Express, { json } from "express";
import { createServer, Server } from "http";
import swaggerUi from "swagger-ui-express";
import { Log } from './classes/Logging/Log';
import { requestLogMiddleware } from './classes/Logging/LoggingMiddleware';
import { DefaultErrorHandler } from './middleware/error-handler';
import { RegisterRoutes } from './routes/routes';
import { hostname, platform, type } from 'os';
import { Calcul } from './classes/Calcul/Calcul'

export const StartServer = async () => {
  // Récupérer le port des variables d'environnement ou préciser une valeur par défaut
  const PORT = process.env.PORT || 5050;

  // Créer l'objet Express
  const app = Express();

  // L'appli parse le corps du message entrant comme du json
  app.use(json());

  // Utiliser un middleware pour créer des logs
  app.use(requestLogMiddleware('req'));

  // Les routes de tsoa
  RegisterRoutes(app);

  // Ajouter un handler pour les erreurs
  app.use(DefaultErrorHandler);

  app.use(Express.static("public"));
  app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(undefined, {
      swaggerOptions: {
        url: "/swagger.json",
      },
    })
  );

  // Demo endpoint pour retourner des infos du serveur
  app.get('/info', (req, res) => {
    res.json({
      title: "NodeJS Boilerplate API",
      host: hostname(),
      platform: platform(),
      type: type(),
      message: 'CI/CD check'
    });
  })

  app.post('/calcul', (req, res) => {
    const calcul = new Calcul(req.body.nb1, req.body.nb2);
    res.json({
      result: calcul.getCalcul() 
    })
  })

  app.get('/players', (usersList: Array<String>, res:any) => {
    res.json ({
      usersList: usersList
    })
  })

  // Lancer le serveur
  return new Promise<Server>(
    (resolve) => {
      const server = createServer(app);
      server.listen(PORT, () => {
        Log(`API Listening on port ${PORT}`)
        resolve(server);
      })     
    }
  );  
}

export const StopServer = async (server: Server|undefined) => {
  if (!server) { return; }
  return new Promise<void>(
    (resolve, reject) => {
      server.close(
        (err) => {
          if (err) {
            reject(err);            
          } else {
            resolve();
          }
        }
      )
    }
  );  
}